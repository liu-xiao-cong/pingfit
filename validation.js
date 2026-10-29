import { PARTS, CARDIO_TYPES } from './domain.js';

/** UI-facing validation. The database separately checks backup size and bytes. */
const DEFAULT_PROFILE = Object.freeze({ name: '训练伙伴', weight: 70, weightConfirmed: false, weeklyGoal: 3, restSeconds: 90 });
const TOKEN = /^[A-Za-z0-9_-]{1,200}$/;
const PART_IDS = new Set(PARTS.filter(part => part.id !== 'all').map(part => part.id));
const CARDIO_IDS = new Set(CARDIO_TYPES.map(type => type.id));
const REST_SECONDS = new Set([30, 60, 90, 120, 180]);
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;
const MAX_SECONDS = 1440 * 60;
const CAPS = { sessions: 20000, photos: 2000, settings: 200, favorites: 5000 };

function invalid(label) { throw new Error(`备份中的${label}无效或不完整，当前记录尚未替换。`); }
function object(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}
function requireObject(value, label) { if (!object(value)) invalid(label); return value; }
function token(value, label) { if (typeof value !== 'string' || !TOKEN.test(value)) invalid(label); return value; }
function text(value, label, max = 10000, empty = true) {
  if (typeof value !== 'string' || value.length > max || (!empty && !value.trim())) invalid(label);
  // Text stays text: no HTML parsing, no entity decoding, and no DOM insertion.
  return value.replace(CONTROL, '');
}
function number(value, label, min, max, integer = false) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) invalid(label);
  return value;
}
function optionalNumber(value, label, min, max, fallback = null) {
  return value === undefined || value === null ? fallback : number(value, label, min, max);
}
function timestamp(value, label, nullable = false) {
  if (nullable && (value === null || value === undefined)) return null;
  if (!['number', 'string'].includes(typeof value) || value === '' || !Number.isFinite(new Date(value).getTime())) invalid(label);
  return new Date(value).toISOString();
}
function clock(value, label) {
  return value === null || value === undefined ? null : number(value, label, 1, 8640000000000000);
}
function array(value, label, max) {
  if (!Array.isArray(value) || value.length > max) invalid(label);
  return value;
}
function unique(records, key, label) {
  const seen = new Set();
  for (const record of records) {
    const id = record[key];
    if (seen.has(id)) invalid(`${label}（重复 ID）`);
    seen.add(id);
  }
}

/** Never trust an imported profile or merge it into an existing user's state. */
export function normalizeProfile(input) {
  const source = object(input) ? input : {};
  const rawName = typeof source.name === 'string' ? source.name.replace(CONTROL, '').trim() : '';
  const name = rawName && !/[<>]/.test(rawName) ? rawName.slice(0, 20) : DEFAULT_PROFILE.name;
  const validWeight = typeof source.weight === 'number' && Number.isFinite(source.weight) && source.weight >= 20 && source.weight <= 350;
  return {
    name,
    weight: validWeight ? Math.round(source.weight * 10) / 10 : DEFAULT_PROFILE.weight,
    weightConfirmed: validWeight && source.weightConfirmed === true,
    weeklyGoal: typeof source.weeklyGoal === 'number' && Number.isInteger(source.weeklyGoal) && source.weeklyGoal >= 1 && source.weeklyGoal <= 7 ? source.weeklyGoal : DEFAULT_PROFILE.weeklyGoal,
    restSeconds: REST_SECONDS.has(source.restSeconds) ? source.restSeconds : DEFAULT_PROFILE.restSeconds,
  };
}

function normalizeSet(input) {
  const set = requireObject(input, '训练组');
  if (typeof set.done !== 'boolean') invalid('训练组完成状态');
  return {
    ...set, id: token(set.id, '训练组 ID'),
    weight: number(set.weight, '训练重量', 0, 2000),
    reps: number(set.reps, '次数或保持秒数', 1, 3600, true), done: set.done,
  };
}

function normalizeExercise(input) {
  const exercise = requireObject(input, '训练动作');
  if (!PART_IDS.has(exercise.part)) invalid('动作部位');
  if (!['reps', 'seconds'].includes(exercise.unit)) invalid('动作计量单位');
  const sets = array(exercise.sets, '动作组数列表', 500).map(normalizeSet);
  if (!sets.length) invalid('动作组数列表');
  unique(sets, 'id', '训练组');
  return {
    ...exercise, id: token(exercise.id, '训练动作 ID'), exerciseId: token(exercise.exerciseId, '动作类型 ID'),
    name: text(exercise.name, '动作名称', 300, false), equipment: text(exercise.equipment, '器械名称', 500, false),
    part: exercise.part, unit: exercise.unit, sets,
  };
}

function normalizeCardio(input) {
  const cardio = requireObject(input, '有氧记录');
  const typeId = cardio.typeId ?? cardio.type;
  if (!CARDIO_IDS.has(typeId) || (cardio.type !== undefined && cardio.type !== typeId)) invalid('有氧类型');
  if (!['estimate', 'device', 'manual'].includes(cardio.caloriesSource)) invalid('有氧热量来源');
  if (cardio.intensity !== undefined && !['light', 'moderate', 'vigorous'].includes(cardio.intensity)) invalid('有氧强度');
  const kcal = optionalNumber(cardio.kcal, '有氧热量', 0, 20000);
  if (cardio.caloriesSource !== 'estimate' && kcal === null) invalid('有氧设备记录热量');
  return {
    ...cardio, id: token(cardio.id, '有氧记录 ID'), typeId,
    minutes: number(cardio.minutes, '有氧时长', 0.1, 1440),
    distance: optionalNumber(cardio.distance, '有氧距离', 0, 1000), kcal,
    caloriesSource: cardio.caloriesSource, intensity: cardio.intensity || 'moderate',
  };
}

function normalizeSession(input) {
  const session = requireObject(input, '训练记录');
  if (!['active', 'completed'].includes(session.status)) invalid('训练状态');
  const exercises = array(session.exercises, '训练动作列表', 200).map(normalizeExercise);
  const cardio = array(session.cardio, '有氧记录列表', 200).map(normalizeCardio);
  unique(exercises, 'id', '训练动作');
  unique(cardio, 'id', '有氧记录');
  const photoIds = array(session.photoIds, '训练照片列表', CAPS.photos).map(id => token(id, '照片关联 ID'));
  if (new Set(photoIds).size !== photoIds.length) invalid('训练照片列表（重复 ID）');
  const elapsedSeconds = number(session.elapsedSeconds, '训练累计时长', 0, MAX_SECONDS);
  const cardioSeconds = cardio.reduce((sum, item) => sum + item.minutes * 60, 0);
  if (cardioSeconds > MAX_SECONDS + 0.01) invalid('有氧累计时长');
  if (session.status === 'completed' && cardioSeconds > elapsedSeconds + 0.61) invalid('总时长（不能少于有氧时长）');
  const runningSince = clock(session.runningSince, '训练开始计时');
  const restEndsAt = clock(session.restEndsAt, '组间休息计时');
  if (session.status === 'completed' && (runningSince !== null || restEndsAt !== null)) invalid('已完成训练的计时状态');
  return {
    ...session, id: token(session.id, '训练记录 ID'),
    startedAt: timestamp(session.startedAt, '训练开始时间'),
    endedAt: timestamp(session.endedAt, '训练结束时间', session.status === 'active'),
    status: session.status, elapsedSeconds, runningSince, restEndsAt,
    weightKg: optionalNumber(session.weightKg, '本次训练体重', 20, 350),
    title: session.title === undefined ? '' : text(session.title, '训练名称', 60),
    notes: text(session.notes, '训练笔记', 10000), feeling: text(session.feeling, '训练感受', 100),
    exercises, cardio, photoIds,
  };
}

function normalizePhoto(input) {
  const photo = requireObject(input, '训练照片');
  const id = token(photo.id, '照片 ID');
  const sessionId = token(photo.sessionId, '照片所属训练 ID');
  requireObject(photo.blob, '照片文件');
  if (typeof photo.blob.type !== 'string' || typeof photo.blob.data !== 'string') invalid('照片编码');
  if (photo.thumbnail !== undefined && photo.thumbnail !== null) {
    requireObject(photo.thumbnail, '照片缩略图');
    if (typeof photo.thumbnail.type !== 'string' || typeof photo.thumbnail.data !== 'string') invalid('缩略图编码');
  }
  return {
    ...photo, id, sessionId,
    name: photo.name === undefined ? '训练照片' : text(photo.name, '照片名称', 300),
    kind: photo.kind === undefined ? 'training' : text(photo.kind, '照片用途', 60),
    createdAt: timestamp(photo.createdAt, '照片时间'),
  };
}

function normalizeFavorite(input) {
  const favorite = requireObject(input, '教学收藏');
  let url;
  try { url = new URL(text(favorite.url, '教学链接', 4096, false)); } catch { invalid('教学链接'); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) invalid('教学链接协议');
  const exerciseId = favorite.exerciseId === undefined || favorite.exerciseId === null || favorite.exerciseId === ''
    ? '' : token(favorite.exerciseId, '收藏关联动作 ID');
  return {
    ...favorite, id: token(favorite.id, '收藏 ID'), title: text(favorite.title, '收藏标题', 300, false),
    url: url.href, exerciseId,
    platform: ['douyin', 'xhs', 'other'].includes(favorite.platform) ? favorite.platform : 'other',
    createdAt: timestamp(favorite.createdAt, '收藏时间'),
  };
}

/** Validate everything before db.importBackup starts its replacement transaction. */
export function validateAppBackup(input) {
  const data = requireObject(input, '文件');
  if (data.format !== 'fitlog-backup' || data.version !== 1) invalid('格式或版本');
  for (const key of Object.keys(CAPS)) array(data[key], `${key} 列表`, CAPS[key]);
  const sessions = data.sessions.map(normalizeSession);
  const photos = data.photos.map(normalizePhoto);
  const favorites = data.favorites.map(normalizeFavorite);
  const settings = data.settings.map(inputSetting => {
    const setting = requireObject(inputSetting, '设置');
    if (!Object.hasOwn(setting, 'value')) invalid('设置值');
    const key = token(setting.key, '设置名称');
    return { key, value: key === 'profile' ? normalizeProfile(setting.value) : setting.value };
  });
  for (const [key, records] of Object.entries({ sessions, photos, favorites, settings })) unique(records, key === 'settings' ? 'key' : 'id', key);
  if (sessions.filter(session => session.status === 'active').length > 1) invalid('未完成训练数量（仅支持一场）');
  const sessionById = new Map(sessions.map(session => [session.id, session]));
  const photoById = new Map(photos.map(photo => [photo.id, photo]));
  for (const session of sessions) {
    for (const id of session.photoIds) if (photoById.get(id)?.sessionId !== session.id) invalid('训练与照片关联');
  }
  for (const photo of photos) if (!sessionById.has(photo.sessionId)) invalid('照片所属训练');
  // Missing profile means defaults, never values left over from the old database.
  if (!settings.some(setting => setting.key === 'profile')) {
    if (settings.length >= CAPS.settings) invalid('设置数量');
    settings.push({ key: 'profile', value: normalizeProfile(null) });
  }
  return { ...data, sessions, photos, favorites, settings };
}
