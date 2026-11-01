import { EXERCISES, createSession, createSet } from './domain.js';

// Original PingFit training helpers. History is the source of truth: suggestions,
// records and the next routine are derived, never written into completed records.
const EXERCISE_INDEX = new Map(EXERCISES.map(exercise => [exercise.id, exercise]));
const TOKEN = /^[A-Za-z0-9_-]{1,200}$/;
const CONTROL = /[\u0000-\u001f\u007f]/;
const emptyProgram = () => ({ version: 1, routines: [], rotation: [] });
const uid = () => globalThis.crypto?.randomUUID?.() || `pf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const array = value => Array.isArray(value) ? value : [];
const time = value => { const result = Date.parse(value); return Number.isFinite(result) ? result : 0; };
const rounded = value => Math.round(value * 10) / 10;
const kindOf = set => set?.kind === 'warmup' ? 'warmup' : 'work';
const validNumber = (value, min, max, integer = false) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max && (!integer || Number.isInteger(value));
const fail = message => { throw new Error(message); };

function routineSet(input) {
  if (!object(input) || !validNumber(input.weight, 0, 2000) || !validNumber(input.reps, 1, 3600, true)) fail('模板中的重量或次数无效。');
  if (input.kind !== undefined && !['work', 'warmup'].includes(input.kind)) fail('模板中的训练组类型无效。');
  return { weight: input.weight, reps: input.reps, kind: kindOf(input) };
}

function normalizeRoutine(input) {
  if (!object(input) || typeof input.id !== 'string' || !TOKEN.test(input.id)) fail('训练模板 ID 无效。');
  if (typeof input.name !== 'string' || !input.name.trim() || input.name.length > 60 || CONTROL.test(input.name)) fail('请填写 1–60 字的模板名称。');
  if (!Array.isArray(input.exercises) || input.exercises.length < 1 || input.exercises.length > 100) fail('模板需要 1–100 个动作。');
  const seen = new Set();
  const exercises = input.exercises.map(item => {
    if (!object(item) || !EXERCISE_INDEX.has(item.exerciseId) || seen.has(item.exerciseId)) fail('模板包含无效或重复的动作。');
    seen.add(item.exerciseId);
    if (!Array.isArray(item.sets) || item.sets.length < 1 || item.sets.length > 100) fail('每个模板动作需要 1–100 组。');
    const restSeconds = item.restSeconds === undefined ? 90 : item.restSeconds;
    if (!validNumber(restSeconds, 0, 900, true)) fail('动作休息时间需要在 0–900 秒内。');
    return { exerciseId: item.exerciseId, sets: item.sets.map(routineSet), restSeconds };
  });
  return { id: input.id, name: input.name.trim(), exercises };
}

export function normalizeTrainingProgram(input, { strict = false } = {}) {
  if (input === null || input === undefined) return emptyProgram();
  try {
    if (!object(input) || input.version !== 1 || !Array.isArray(input.routines) || input.routines.length > 50 || !Array.isArray(input.rotation) || input.rotation.length > 20) fail('训练计划格式无效。');
    const routines = input.routines.map(normalizeRoutine);
    const ids = new Set(routines.map(routine => routine.id));
    if (ids.size !== routines.length) fail('训练模板 ID 不能重复。');
    if (new Set(input.rotation).size !== input.rotation.length || input.rotation.some(id => !ids.has(id))) fail('轮换计划包含无效或重复的模板。');
    return { version: 1, routines, rotation: [...input.rotation] };
  } catch (error) {
    if (strict) throw error;
    return emptyProgram();
  }
}

export function rotationKey(program) {
  return normalizeTrainingProgram(program).rotation.join('|');
}

function completedHistory(sessions, excludeId = '') {
  const seen = new Set();
  return array(sessions).filter(session => {
    if (!object(session) || session.status !== 'completed' || session.id === excludeId || seen.has(session.id) || !time(session.startedAt)) return false;
    seen.add(session.id);
    return true;
  }).sort((a, b) => time(b.startedAt) - time(a.startedAt) || time(b.endedAt) - time(a.endedAt));
}

export function nextRoutine(input, sessions = []) {
  const program = normalizeTrainingProgram(input);
  if (!program.rotation.length) return null;
  const key = program.rotation.join('|');
  const history = completedHistory(sessions).sort((a, b) => (time(b.endedAt) || time(b.startedAt)) - (time(a.endedAt) || time(a.startedAt)));
  const previous = history.find(session => session.cycle?.rotationKey === key && program.rotation.includes(session.cycle.routineId));
  const index = previous ? (program.rotation.indexOf(previous.cycle.routineId) + 1) % program.rotation.length : 0;
  return program.routines.find(routine => routine.id === program.rotation[index]) || null;
}

function unitOf(entry) {
  return entry?.unit || EXERCISE_INDEX.get(entry?.exerciseId)?.unit || 'reps';
}

function sameExercise(a, b) {
  return a?.exerciseId === b?.exerciseId && a?.equipment === b?.equipment && unitOf(a) === unitOf(b)
    && (a?.equipmentId || '') === (b?.equipmentId || '');
}

function completedSets(entry, workOnly = false) {
  return array(entry?.sets).filter(set => object(set) && set.done === true && validNumber(set.weight, 0, 2000) && validNumber(set.reps, 1, 3600, true) && (!workOnly || kindOf(set) === 'work'));
}

function previousExercise(entry, history) {
  for (const session of history) {
    const found = array(session.exercises).find(candidate => sameExercise(candidate, entry) && completedSets(candidate).length);
    if (found) return { session, entry: found, sets: completedSets(found) };
  }
  return null;
}

function newSet(set) {
  return { ...createSet({ weight: set.weight, reps: set.reps }), kind: kindOf(set) };
}

function defaultEntry(exerciseId, profile) {
  const entry = createSession([exerciseId], profile).exercises[0];
  if (!entry) fail('找不到这个训练动作。');
  entry.sets = entry.sets.map(set => ({ ...set, kind: 'work' }));
  entry.restSeconds = validNumber(profile?.restSeconds, 0, 900, true) ? profile.restSeconds : 90;
  return entry;
}

function copyEntry(snapshot, sets, profile) {
  const entry = defaultEntry(snapshot.exerciseId, profile);
  // A repeat keeps the measurement identity from that actual session. It never
  // copies arbitrary metadata, photos or completed flags into the new session.
  for (const field of ['name', 'part', 'equipment', 'unit', 'equipmentId']) {
    if (snapshot[field] !== undefined) entry[field] = snapshot[field];
  }
  entry.sets = sets.map(newSet);
  entry.restSeconds = validNumber(snapshot.restSeconds, 0, 900, true) ? snapshot.restSeconds : entry.restSeconds;
  return entry;
}

function validCycle(cycle, routineId) {
  if (cycle === null || cycle === undefined) return null;
  if (!object(cycle) || typeof cycle.rotationKey !== 'string' || !cycle.rotationKey || cycle.rotationKey.length > 5000
    || cycle.rotationKey.split('|').length > 20 || new Set(cycle.rotationKey.split('|')).size !== cycle.rotationKey.split('|').length
    || cycle.rotationKey.split('|').some(id => !TOKEN.test(id)) || !TOKEN.test(cycle.routineId || '') || cycle.routineId !== routineId
    || !cycle.rotationKey.split('|').includes(routineId)) fail('轮换训练来源无效，请重新开始。');
  return { rotationKey: cycle.rotationKey, routineId: cycle.routineId };
}

export function createTrainingDraft({ exerciseIds = [], routine = null, previousSession = null, sessions = [], profile = {}, title = '', cycle = null } = {}) {
  const draft = createSession([], profile);
  const history = completedHistory(sessions);
  if (routine) {
    const normalized = normalizeRoutine(routine);
    draft.title = title || normalized.name;
    draft.routineId = normalized.id;
    draft.routineName = normalized.name;
    draft.exercises = normalized.exercises.map(item => {
      const entry = defaultEntry(item.exerciseId, profile);
      const source = previousExercise(entry, history);
      const offsets = { work: 0, warmup: 0 };
      let usedHistory = false;
      entry.sets = item.sets.map(set => {
        const kind = kindOf(set);
        const matching = source?.sets.filter(candidate => kindOf(candidate) === kind)[offsets[kind]++];
        if (matching) usedHistory = true;
        return newSet({ ...set, weight: matching ? matching.weight : set.weight });
      });
      entry.restSeconds = item.restSeconds;
      if (usedHistory) entry.prefill = { sessionId: source.session.id, startedAt: source.session.startedAt };
      return entry;
    });
  } else if (previousSession) {
    if (previousSession.status !== 'completed') fail('只能重复已完成的训练。');
    draft.title = title || previousSession.title || '再次训练';
    const seen = new Set();
    draft.exercises = array(previousSession.exercises).filter(entry => {
      if (!EXERCISE_INDEX.has(entry.exerciseId) || seen.has(entry.exerciseId) || !completedSets(entry).length) return false;
      seen.add(entry.exerciseId);
      return true;
    }).map(snapshot => {
      const entry = copyEntry(snapshot, completedSets(snapshot), profile);
      entry.prefill = { sessionId: previousSession.id, startedAt: previousSession.startedAt };
      return entry;
    });
    if (TOKEN.test(previousSession.routineId || '')) {
      draft.routineId = previousSession.routineId;
      draft.routineName = String(previousSession.routineName || draft.title).slice(0, 60);
    }
  } else {
    draft.title = title;
    draft.exercises = [...new Set(array(exerciseIds))].filter(id => EXERCISE_INDEX.has(id)).map(exerciseId => {
      let entry = defaultEntry(exerciseId, profile);
      const source = previousExercise(entry, history);
      if (source) {
        entry = copyEntry(entry, source.sets, profile);
        entry.prefill = { sessionId: source.session.id, startedAt: source.session.startedAt };
      }
      return entry;
    });
  }
  const valid = validCycle(cycle, draft.routineId);
  if (valid) draft.cycle = valid;
  return draft;
}

export function routineFromSession(session, name = '') {
  const seen = new Set();
  const exercises = array(session?.exercises).filter(entry => {
    if (!EXERCISE_INDEX.has(entry.exerciseId) || seen.has(entry.exerciseId)) return false;
    seen.add(entry.exerciseId);
    return true;
  }).map(entry => ({
    exerciseId: entry.exerciseId,
    sets: array(entry.sets).map(set => ({ weight: set.weight, reps: set.reps, kind: kindOf(set) })),
    restSeconds: validNumber(entry.restSeconds, 0, 900, true) ? entry.restSeconds : 90,
  }));
  return normalizeRoutine({ id: uid(), name: name.trim() || session?.title || '我的训练模板', exercises });
}

export function replaceTrainingExercise(session, exerciseEntryId, targetExerciseId, sessions = [], profile = {}) {
  if (!session || session.status !== 'active') fail('请先开始一次训练。');
  const source = array(session.exercises).find(entry => entry.id === exerciseEntryId);
  if (!source) fail('原动作已变更，请重新打开替代动作。');
  if (source.exerciseId === targetExerciseId) fail('当前已经是这个动作。');
  if (!EXERCISE_INDEX.has(targetExerciseId)) fail('找不到替代动作。');
  if (array(session.exercises).some(entry => entry.exerciseId === targetExerciseId)) fail('替代动作已在本次训练中，请直接记录该动作。');
  const done = completedSets(source);
  const pending = array(source.sets).filter(set => set.done !== true);
  if (done.length && !pending.length) fail('这个动作已全部完成，可以另外添加新动作。');
  const replacement = createTrainingDraft({ exerciseIds: [targetExerciseId], sessions, profile }).exercises[0];
  if (pending.length) {
    const pattern = replacement.sets;
    replacement.sets = Array.from({ length: pending.length }, (_, index) => newSet(pattern[index] || pattern[pattern.length - 1]));
  }
  const result = structuredClone(session);
  const at = result.exercises.findIndex(entry => entry.id === exerciseEntryId);
  if (done.length) {
    result.exercises[at].sets = structuredClone(done);
    result.exercises.splice(at + 1, 0, replacement);
  } else result.exercises.splice(at, 1, replacement);
  result.restEndsAt = null;
  return result;
}

function metrics(sets, unit) {
  return {
    sets: sets.length,
    volume: unit === 'seconds' ? 0 : rounded(sets.reduce((sum, set) => sum + set.weight * set.reps, 0)),
    bestWeight: sets.length ? Math.max(...sets.map(set => set.weight)) : 0,
    bestReps: unit === 'seconds' || !sets.length ? 0 : Math.max(...sets.map(set => set.reps)),
    bestSeconds: unit === 'seconds' && sets.length ? Math.max(...sets.map(set => set.reps)) : 0,
  };
}

function matchingWork(entry, session) {
  return array(session.exercises).filter(candidate => sameExercise(entry, candidate)).flatMap(candidate => completedSets(candidate, true));
}

function entryKey(entry) {
  return JSON.stringify([entry.exerciseId, entry.equipment, unitOf(entry), entry.equipmentId || '']);
}

export function trainingHighlights(session, sessions = []) {
  const history = completedHistory(sessions, session?.id).filter(previous => time(previous.startedAt) < time(session?.startedAt));
  const groups = new Map();
  for (const entry of array(session?.exercises)) {
    const sets = completedSets(entry, true);
    if (!sets.length) continue;
    const key = entryKey(entry);
    if (!groups.has(key)) groups.set(key, { entry, sets: [] });
    groups.get(key).sets.push(...sets);
  }
  const comparisons = [];
  const records = [];
  if (!groups.size) return { previousSession: null, comparisons, records };
  for (const { entry, sets } of groups.values()) {
    const unit = unitOf(entry);
    const prior = history.find(previous => matchingWork(entry, previous).length);
    const previousSets = prior ? matchingWork(entry, prior) : [];
    const current = metrics(sets, unit);
    const previous = prior ? metrics(previousSets, unit) : null;
    comparisons.push({ exerciseId: entry.exerciseId, name: entry.name, equipment: entry.equipment, unit, current, previous, previousDate: prior?.startedAt || null, volumeDelta: previous && unit !== 'seconds' ? rounded(current.volume - previous.volume) : null });
    const allPrevious = history.flatMap(previous => matchingWork(entry, previous));
    const base = { exerciseId: entry.exerciseId, name: entry.name };
    if (unit !== 'seconds' && current.bestWeight > 0) {
      const previousValue = allPrevious.length ? Math.max(...allPrevious.map(set => set.weight)) : null;
      if (previousValue === null || current.bestWeight > previousValue) records.push({ ...base, type: 'weight', value: current.bestWeight, previousValue, baseline: previousValue === null, unit: 'kg' });
    }
    const candidates = [...new Set(sets.map(set => set.weight))].map(weight => {
      const value = Math.max(...sets.filter(set => set.weight === weight).map(set => set.reps));
      const comparable = allPrevious.filter(set => set.weight === weight);
      const previousValue = comparable.length ? Math.max(...comparable.map(set => set.reps)) : null;
      return { ...base, type: unit === 'seconds' ? 'seconds' : 'reps', value, previousValue, weight, baseline: previousValue === null, unit: unit === 'seconds' ? '秒' : '次' };
    }).filter(record => record.baseline || record.value > record.previousValue).sort((a, b) => Number(a.baseline) - Number(b.baseline) || b.weight - a.weight || b.value - a.value);
    if (candidates.length) records.push(candidates[0]);
  }
  const keys = [...groups.keys()].sort().join('||');
  const previousSession = history.find(previous => session?.routineId
    ? previous.routineId === session.routineId
    : [...new Set(array(previous.exercises).filter(entry => completedSets(entry, true).length).map(entryKey))].sort().join('||') === keys) || null;
  return { previousSession, comparisons, records };
}
