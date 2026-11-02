// Exercise notes are concise Chinese paraphrases of linked ACE / NASM / wger guides.
// wger-derived entries retain their individual attribution and content licence.
// MET estimates are gross energy estimates, including resting energy; see SOURCES.md.
export const PARTS = [
  { id: 'all', label: '全部' }, { id: 'legs', label: '腿臀' },
  { id: 'shoulders', label: '肩部' }, { id: 'back', label: '背部' },
  { id: 'chest', label: '胸部' }, { id: 'arms', label: '手臂' },
  { id: 'core', label: '核心' },
];

const ace = (path) => `https://www.acefitness.org/resources/everyone/exercise-library/${path}/`;
const exercise = (id, name, part, equipment, difficulty, steps, tips, alternatives, source, extras = {}) => ({
  id, name, part, equipment, difficulty, steps, tips, alternatives, sourceUrl: ace(source), unit: 'reps', ...extras,
});

export const EXERCISES = [
  exercise('leg-press', '坐姿蹬腿', 'legs', '蹬腿机', '入门',
    ['调整座椅，让背部与臀部贴紧靠垫，双脚完整踩住踏板。', '保持躯干稳定，用脚推动踏板至双腿自然伸展。', '控制回程，回到膝盖约弯曲 90° 的起点。'],
    ['不要锁死膝盖或让臀部离开坐垫。', '器械配重按机器显示记录；不同机器的数值不宜直接比较。'],
    ['goblet-squat', 'bodyweight-squat'], '154/seated-leg-press'),
  exercise('goblet-squat', '哑铃杯式深蹲', 'legs', '哑铃', '进阶',
    ['双脚约肩宽，双手竖握一只哑铃放在胸前。', '保持背部稳定，髋与膝一起弯曲，缓慢下蹲。', '在能保持脚跟着地和背部稳定的幅度内，用双脚蹬地站起。'],
    ['肘部靠近身体，不要用腰背甩起重量。', '先使用能控制全程的重量，动作幅度根据自身控制能力调整。'],
    ['leg-press', 'bodyweight-squat'], '362/goblet-squat'),
  exercise('bodyweight-squat', '徒手深蹲', 'legs', '自重', '入门',
    ['双脚略宽于髋，脚尖自然朝外，站稳。', '腹部收紧，髋部向后再向下，膝盖顺着脚尖方向移动。', '在脚跟不抬起、背部稳定的深度停住，再蹬地站起。'],
    ['保持脚掌稳定，避免膝盖向内塌。', '下蹲吸气，站起呼气，不追求无法控制的深度。'],
    ['leg-press', 'goblet-squat'], '135/bodyweight-squat'),
  exercise('hamstring-curl', '俯卧腿弯举', 'legs', '腿弯举机', '入门',
    ['俯卧，膝关节对齐器械转轴，滚垫放在小腿下段，避开脚跟。', '握稳把手并稳定腹部，弯曲膝盖把滚垫拉向臀部。', '短暂停留后，缓慢放回起点。'],
    ['不要抬起臀部或拱腰借力。', '先调好滚垫位置，再选择能控制回程的重量。'],
    ['glute-bridge'], '153/lying-hamstrings-curl'),
  exercise('calf-raise', '器械提踵', 'legs', '提踵机', '入门',
    ['按照器械说明调座椅与配重，前脚掌放在踏板上。', '保持腿部稳定，用前脚掌推踏板，伸展踝关节。', '缓慢回到起点，避免重量砸落。'],
    ['此条对应坐姿腿前伸式提踵器械。', '只在可控制的踝关节幅度内移动。'],
    ['bodyweight-squat'], '294/calf-raise'),
  exercise('glute-bridge', '臀桥', 'legs', '自重 · 瑜伽垫', '入门',
    ['仰卧屈膝，双脚与髋同宽，脚掌平放地面。', '腹部轻收紧，脚跟压地，收紧臀部抬起髋部。', '保持腰部稳定，缓慢把臀部放回地面。'],
    ['不要为了抬得更高而拱腰。', '自重动作将外加重量记为 0 kg。'],
    ['bodyweight-squat', 'hamstring-curl'], '49/glute-bridge'),
  exercise('forward-lunge', '前跨弓步蹲', 'legs', '自重', '进阶',
    ['双脚与髋同宽站稳，收紧腹部。', '向前迈一步，脚掌落稳后降低髋部，弯曲双膝。', '以前脚蹬地回到站姿，再换另一侧。'],
    ['控制身体左右晃动，前膝朝向脚尖。', '次数按左右合计记录；先在可稳定的幅度内练习。'],
    ['bodyweight-squat', 'leg-press'], '94/forward-lunge'),
  exercise('machine-shoulder-press', '器械推肩', 'shoulders', '推肩机', '入门',
    ['调节座椅，使把手在肩部附近，背部贴靠垫，双脚踩稳。', '握住靠近身体的把手，肘部朝前，保持手腕与前臂对齐，平稳向上推。', '手臂自然伸展后，缓慢下放至起始位置。'],
    ['保持躯干稳定，不要拱腰或耸肩借力。', '不同推肩机的握法与起点不同，先查看器械说明。'],
    ['front-raise', 'lateral-raise'], '187/seated-machine-close-grip-shoulder-press'),
  exercise('lateral-raise', '器械侧平举', 'shoulders', '侧平举机', '入门',
    ['调整座椅，屈肘约 90°，上臂垫放在肘部上方。', '保持屈肘，用上臂向外上方推起器械垫。', '控制重量，缓慢回到起点。'],
    ['上身保持稳定，不要耸肩或晃动身体。', '先用较轻配重熟悉器械轨迹。'],
    ['front-raise', 'reverse-fly'], '295/lateral-shoulder-raise'),
  exercise('front-raise', '哑铃前平举', 'shoulders', '哑铃', '入门',
    ['站稳，哑铃放于大腿前，肘部保持轻微弯曲。', '保持躯干稳定，缓慢将哑铃举到约肩高。', '控制下放，回到大腿前方。'],
    ['不要后仰借力，保持手腕自然。', '肩部不适时停止；抬举高度以舒适且可控制为准。'],
    ['machine-shoulder-press', 'lateral-raise'], '54/front-raise'),
  exercise('diagonal-raise', '哑铃斜向抬举', 'shoulders', '哑铃', '进阶',
    ['双脚与髋同宽，一手持哑铃置于对侧大腿前方。', '身体保持朝前，将手臂斜向外抬至约肩高。', '沿原路缓慢下放，再换另一侧。'],
    ['不要扭转髋部带动重量。', '次数按左右合计记录。'],
    ['front-raise', 'lateral-raise'], '371/diagonal-raise'),
  exercise('reverse-fly', '上斜反向飞鸟', 'shoulders', '哑铃 · 上斜凳', '入门',
    ['胸部贴在约 45–60° 的上斜靠背，双脚踩稳，双臂自然下垂。', '肘部微屈，双臂向两侧打开至接近肩高。', '保持胸部贴靠背，缓慢下放。'],
    ['不要拱腰或把哑铃甩到头部后方。', '选择能慢慢放回的轻重量。'],
    ['high-row', 'lateral-raise'], '34/incline-reverse-fly'),
  exercise('lat-pulldown', '高位下拉', 'back', '高位下拉机', '入门',
    ['调好大腿固定垫，双脚踩稳，握住上方横杆。', '先稳定肩胛，再把肘部向身体两侧下拉，横杆靠近上胸。', '停止继续后仰，控制手臂伸展并放回。'],
    ['横杆拉向胸前，不向颈后拉。', '避免后仰甩动，手腕保持自然。'],
    ['high-row', 'dumbbell-row'], '158/seated-lat-pulldown'),
  exercise('high-row', '坐姿高位划船', 'back', '高位划船机', '入门',
    ['调节座椅使把手约与肩同高，胸部轻贴胸垫，双脚踩稳。', '屈肘拉向胸部，保持躯干与手腕稳定。', '短暂停留，再缓慢伸直手臂。'],
    ['不要后仰拱腰或弓背追着把手走。', '这是胸垫支撑式高位划船，按实际器械名称记录。'],
    ['dumbbell-row', 'lat-pulldown'], '169/seated-high-back-rows'),
  exercise('dumbbell-row', '单臂哑铃划船', 'back', '哑铃 · 平凳', '进阶',
    ['一侧手与膝支撑在平凳上，另一脚踩地，背部保持平稳。', '持哑铃一侧屈肘向后拉，手臂靠近身体。', '不扭转身体，缓慢下放，完成后换侧。'],
    ['不要用躯干旋转把重量甩起。', '重量填写单只哑铃；次数按左右合计填写。'],
    ['high-row', 'lat-pulldown'], '126/single-arm-row'),
  exercise('barbell-row', '杠铃俯身划船', 'back', '杠铃', '高阶',
    ['双手正握杠铃，膝盖微屈，髋部向后折叠。', '保持背部稳定，屈肘将杠铃拉向腹部。', '缓慢伸直手臂下放，保持躯干角度。'],
    ['不要反复抬起躯干甩动杠铃。', '重量填写杠铃杆与杠铃片的合计重量。'],
    ['high-row', 'dumbbell-row'], '12/bent-over-row'),
  exercise('machine-chest-press', '坐姿器械推胸', 'chest', '推胸机', '入门',
    ['调好座椅，把手约在胸中部，背部贴靠垫，双脚踩稳。', '手腕保持自然，向前推至手臂自然伸展。', '保持肩胛与靠垫接触，缓慢回程。'],
    ['不要锁肘或推到肩膀向前卷起。', '保持躯干稳定，避免拱腰借力。'],
    ['dumbbell-bench-press', 'incline-press'], '188/seated-chest-press'),
  exercise('dumbbell-bench-press', '平板哑铃卧推', 'chest', '哑铃 · 平凳', '进阶',
    ['仰卧平凳，头、肩、臀保持支撑，双脚踩稳。', '手腕对齐前臂，缓慢将哑铃下放到胸部两侧的可控位置。', '呼气推起，不反弹或拱腰。'],
    ['举起与放下哑铃时保持握稳，必要时请同伴辅助。', '重量填写两只哑铃合计重量，便于训练量口径一致。'],
    ['machine-chest-press', 'incline-press'], '19/chest-press'),
  exercise('incline-press', '上斜哑铃卧推', 'chest', '哑铃 · 上斜凳', '入门',
    ['在上斜凳上仰卧，头肩臀贴稳靠垫，双脚踩地。', '保持手腕自然，缓慢将哑铃下放到上胸两侧。', '稳定推起，再控制回到起点。'],
    ['不要为了抬起重量而拱腰或让哑铃反弹。', '重量填写两只哑铃合计重量；首次使用先请教练确认凳角度。'],
    ['machine-chest-press', 'dumbbell-bench-press'], '25/incline-chest-press'),
  exercise('hammer-curl', '哑铃锤式弯举', 'arms', '哑铃', '进阶',
    ['站稳，双手持哑铃放在身体两侧，掌心朝向身体。', '上臂留在身体旁，屈肘把哑铃举向肩部。', '手腕保持直立，缓慢下放。'],
    ['不要耸肩、后仰或前后甩动。', '双臂同时做时填双只合计重量；交替做时填单只重量和左右合计次数。'],
    ['dumbbell-curl', 'machine-biceps-curl'], '10/hammer-curl'),
  exercise('machine-biceps-curl', '器械二头弯举', 'arms', '弯举机', '入门',
    ['调节座椅，让肘部对齐器械转轴，上臂贴住斜垫。', '握住把手，保持手腕自然，屈肘向上弯举。', '保持身体不晃动，缓慢伸展回程。'],
    ['不要把肘部锁死或后仰借力。', '先调座椅位置再开始，肘部始终有支撑。'],
    ['dumbbell-curl', 'hammer-curl'], '184/seated-biceps-curl'),
  exercise('dumbbell-curl', '坐姿哑铃弯举', 'arms', '哑铃 · 靠背凳', '入门',
    ['坐稳靠背凳，双脚踩地，掌心向前，双臂在身体两侧。', '上臂保持在身侧，双肘一起弯曲，把哑铃举向胸部。', '不耸肩或拱腰，缓慢下放。'],
    ['手腕与前臂保持对齐，不用身体摆动借力。', '双臂同时做，重量填写两只哑铃合计重量。'],
    ['machine-biceps-curl', 'hammer-curl'], '44/seated-biceps-curl'),
  exercise('triceps-pressdown', '绳索三头下压', 'arms', '龙门架 · 绳索', '入门',
    ['滑轮调至高位，双手握绳，站稳并稍屈膝。', '肘部贴近身体，伸直前臂，把绳索压向地面。', '保持上臂位置，缓慢屈肘回程。'],
    ['不要用上身向前冲来带动配重。', '手腕保持自然，回程不让配重砸落。'],
    ['machine-chest-press'], '3/triceps-pressdown'),
  exercise('plank', '平板支撑', 'core', '自重 · 瑜伽垫', '进阶',
    ['前臂撑地，肘部位于肩部下方，双腿伸直。', '收紧腹部与腿部，抬起躯干，保持身体稳定。', '保持呼吸，结束时缓慢落地。'],
    ['不要塌腰、抬得过高或耸肩。', '按秒记录，每组外加重量为 0 kg；只能稳定保持多久就记录多久。'],
    ['bird-dog', 'crunch'], '32/front-plank', { unit: 'seconds' }),
  exercise('bird-dog', '鸟狗式', 'core', '自重 · 瑜伽垫', '进阶',
    ['四点跪姿，双手在肩下，膝盖在髋下。', '稳定腹部，同时伸出对侧手与腿，保持髋部朝下。', '缓慢收回，换另一组手脚重复。'],
    ['抬高以腰背不塌陷、身体不旋转为限。', '次数按左右合计记录，外加重量填写 0 kg。'],
    ['plank', 'crunch'], '14/bird-dog'),
  exercise('crunch', '卷腹', 'core', '自重 · 瑜伽垫', '入门',
    ['仰卧屈膝，脚掌平放，双手轻放头侧。', '收缩腹部，把胸廓靠近骨盆，上背缓慢离开地面。', '保持颈部放松，控制下放。'],
    ['不要用双手拉脖子，也不要借惯性猛坐起。', '脚、尾骨和下背保持与垫子接触。'],
    ['machine-crunch', 'bird-dog'], '52/crunch'),
  exercise('machine-crunch', '坐姿器械卷腹', 'core', '卷腹机', '入门',
    ['调好座椅与配重，臀部坐稳，小腿靠住滚垫。', '双手握把，收紧腹部，控制身体向前卷曲。', '缓慢回到起点。'],
    ['避免用手臂猛拉或让配重快速回落。', '不同器械轨迹不同，先按机器说明调整。'],
    ['crunch', 'bird-dog'], '291/seated-crunch'),
  exercise('barbell-bench-press', '杠铃平板卧推', 'chest', '杠铃 · 平凳', '进阶',
    ['仰卧平凳，头、肩与臀部有支撑，双脚踩稳，双手握杠略宽于肩。', '保持肩部稳定，缓慢将杠铃下放至胸部附近的可控位置。', '平稳向上推回，控制杠铃，不在胸部反弹。'],
    ['先熟悉空杆轨迹，并使用合适的保护架或请同伴协助。', '重量填写杠铃杆与杠铃片的合计重量。'],
    ['dumbbell-bench-press', 'machine-chest-press'], '', {
      sourceUrl: 'https://wger.de/api/v2/exerciseinfo/73/', sourceLabel: 'wger 动作库',
      contentLicense: 'CC BY-SA 3.0', contentLicenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
      contentAuthor: 'sistab2', contentChanges: '中文简述，补充保护与重量记录口径。',
    }),
  exercise('dumbbell-romanian-deadlift', '哑铃罗马尼亚硬拉', 'legs', '哑铃', '进阶',
    ['双脚与髋同宽站稳，双手各握一只哑铃，膝盖轻微弯曲。', '收紧腹部并保持背部稳定，将髋部向后移，双臂随身体缓慢下放。', '到腿后侧有拉伸感且背部仍可稳定的位置，将髋部带回并站起。'],
    ['动作来自髋部折叠，不弓背或靠甩动身体提起哑铃；以能控制的幅度为准。', '双臂同时做，重量填写两只哑铃合计重量，先用轻重量熟悉轨迹。'],
    ['glute-bridge', 'hamstring-curl'], '', {
      sourceUrl: 'https://www.nasm.org/resource-center/exercise-library/dumbbell-romanian-deadlift',
      sourceLabel: 'NASM Exercise Library',
    }),
  exercise('dumbbell-lateral-raise', '哑铃侧平举', 'shoulders', '哑铃', '入门',
    ['站稳，髋与膝轻微弯曲，双手各握一只哑铃放在身体两侧。', '肘部保持轻微弯曲，双臂向两侧缓慢抬起至约肩高。', '保持身体稳定，沿原路控制下放。'],
    ['选择能平稳放回的重量，不耸肩或晃动躯干借力。', '双臂同时做，重量填写两只哑铃合计重量；此动作与侧平举机分开记录。'],
    ['lateral-raise', 'front-raise'], '', {
      sourceUrl: 'https://wger.de/api/v2/exerciseinfo/348/', sourceLabel: 'wger 动作库',
      contentLicense: 'CC BY-SA 3.0', contentLicenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
      contentAuthor: 'BFad07、wger.de', contentChanges: '中文简述，限定双哑铃版本并补充重量记录口径。',
    }),
  exercise('seated-cable-row', '坐姿窄握绳索划船', 'back', '低位绳索划船机 · 窄握把手', '入门',
    ['坐稳并踩住踏板，膝盖微屈，双手握住窄握把手，背部保持稳定。', '保持上身直立，肘部贴近身体向后拉，把手靠近腹部。', '短暂停留后，缓慢伸直手臂回到起点。'],
    ['不靠后仰或来回晃动上身带起配重。', '按器械配重标示记录；此动作为低位绳索划船，与胸垫式高位划船分开记录。'],
    ['high-row', 'dumbbell-row'], '', {
      sourceUrl: 'https://wger.de/api/v2/exerciseinfo/512/', sourceLabel: 'wger 动作库',
      contentLicense: 'CC BY-SA 3.0', contentLicenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
      contentAuthor: 'wger.de', contentChanges: '中文简述，结合 ACE 核对低位窄握版本并补充重量记录口径。',
    }),
];

// Editable starting lists, not individualized programming or a prescribed load.
export const PLANS = [
  { id: 'full-body', name: '全身基础', description: '每周选 2–3 天，先熟悉器械和完整记录。动作、组数和重量都可调整。', minutes: 45, exerciseIds: ['leg-press', 'machine-chest-press', 'lat-pulldown', 'machine-shoulder-press', 'crunch'], tag: '每周 2–3 次', daysPerWeek: 2 },
  { id: 'legs-core', name: '腿臀与核心', description: '本次重点练腿臀与核心；每周 2–3 次时，可与全身或上肢模板轮换。', minutes: 40, exerciseIds: ['leg-press', 'goblet-squat', 'hamstring-curl', 'calf-raise', 'glute-bridge', 'crunch'], tag: '腿臀重点', daysPerWeek: 3 },
  { id: 'upper-body', name: '背肩与上肢', description: '本次重点练背肩与上肢；每周 2–3 次时，可与腿臀或全身模板轮换。', minutes: 45, exerciseIds: ['lat-pulldown', 'high-row', 'machine-shoulder-press', 'reverse-fly', 'machine-chest-press', 'triceps-pressdown'], tag: '背肩重点', daysPerWeek: 3 },
];

const compendium = 'https://pacompendium.com/';
export const CARDIO_TYPES = [
  { id: 'walk', label: '快走 / 跑步机', met: 4.8, description: '平地 5.6–6.3 km/h，无坡度', code: '17200 / 17358', sourceUrl: `${compendium}walking/`, intensities: { light: 3.0, moderate: 4.8, vigorous: 5.5 } },
  { id: 'run', label: '慢跑', met: 7.5, description: '一般慢跑，自选配速', code: '12020', sourceUrl: `${compendium}running/` },
  { id: 'cycle', label: '室内单车', met: 6.8, description: '固定自行车，一般强度', code: '01200', sourceUrl: `${compendium}bicycling/`, intensities: { light: 4.0, moderate: 6.8, vigorous: 8.0 } },
  { id: 'elliptical', label: '椭圆机', met: 5.0, description: '中等用力', code: '02048', sourceUrl: `${compendium}conditioning-exercise/`, intensities: { moderate: 5.0, vigorous: 9.0 } },
  { id: 'row', label: '划船机', met: 5.0, description: '低于 100 W，中等用力', code: '02071', sourceUrl: `${compendium}conditioning-exercise/`, intensities: { moderate: 5.0, vigorous: 7.5 } },
  { id: 'stairs', label: '登阶机', met: 9.3, description: '阶梯式登阶机，一般强度', code: '02065', sourceUrl: `${compendium}conditioning-exercise/` },
];

const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const finite = (value) => value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value));
const nonNegative = (value, fallback = 0) => finite(value) ? Math.max(0, Number(value)) : fallback;
const rounded = (value, precision = 1) => Number(value.toFixed(precision));
const list = (value) => Array.isArray(value) ? value : [];

export function createSet({ weight = 0, reps = 10 } = {}) {
  return { id: uid(), weight: nonNegative(weight), reps: Math.floor(nonNegative(reps, 10)), done: false };
}

export function createSession(exerciseIds = [], profile = {}) {
  const ids = new Set(list(exerciseIds));
  return {
    id: uid(), startedAt: new Date().toISOString(), endedAt: null, elapsedSeconds: 0,
    status: 'active', weightKg: profile.weightConfirmed && Number(profile.weight) > 0 ? Number(profile.weight) : null,
    exercises: [...ids].map((id) => EXERCISES.find((item) => item.id === id)).filter(Boolean).map((item) => ({
      id: uid(), exerciseId: item.id, name: item.name, part: item.part, equipment: item.equipment, unit: item.unit,
      sets: Array.from({ length: 3 }, () => createSet({ reps: item.unit === 'seconds' ? 30 : 10 })),
    })),
    cardio: [], photoIds: [], notes: '', feeling: '',
  };
}

export function effectiveWeight(profile = {}, session = {}) {
  const snapshot = Number(session.weightKg);
  const current = Number(profile.weight);
  if (Number.isFinite(snapshot) && snapshot > 0) return { weight: snapshot, assumed: false };
  if (Number.isFinite(current) && current > 0) return { weight: current, assumed: profile.weightConfirmed === false };
  return { weight: 70, assumed: true };
}

// kcal = MET × 3.5 × kg / 200 × minutes. An unknown type yields 0, not invented activity data.
export function estimateCardio(type, minutes, weight = 70, intensity) {
  const definition = CARDIO_TYPES.find((item) => item.id === (typeof type === 'object' ? type?.id : type));
  if (!definition) return 0;
  const met = definition.intensities?.[intensity] ?? definition.met;
  const kg = finite(weight) && Number(weight) > 0 ? Number(weight) : 70;
  return rounded(met * 3.5 * kg / 200 * nonNegative(minutes));
}

export function summarizeCardio(item = {}, profile = {}, session = {}) {
  item = item && typeof item === 'object' ? item : {};
  const minutes = nonNegative(item.minutes ?? (finite(item.durationSeconds) ? Number(item.durationSeconds) / 60 : 0));
  const type = item.typeId ?? item.type ?? '';
  const supplied = item.kcal ?? item.calories;
  const source = item.caloriesSource ?? item.source ?? '';
  const hasRecorded = finite(supplied) && Number(supplied) >= 0 && !['estimate', 'estimated', 'met'].includes(source);
  const { weight, assumed } = effectiveWeight(profile, session);
  return {
    minutes, kcal: hasRecorded ? rounded(Number(supplied)) : estimateCardio(type, minutes, weight, item.intensity),
    source: hasRecorded ? (source || 'manual') : 'estimate', estimated: !hasRecorded, weight, weightAssumed: assumed,
  };
}

export function summarizeSession(session = {}, profile = {}) {
  const exercises = list(session.exercises);
  const cardio = list(session.cardio).map((item) => summarizeCardio(item, profile, session));
  let completedSets = 0;
  let totalVolume = 0;
  let exerciseCount = 0;
  for (const item of exercises) {
    if (!item || typeof item !== 'object') continue;
    let completed = false;
    const unit = item.unit ?? EXERCISES.find((definition) => definition.id === item.exerciseId)?.unit;
    for (const set of list(item.sets)) {
      if (!set || typeof set !== 'object') continue;
      if (set.done !== true || nonNegative(set.reps) <= 0) continue;
      completedSets += 1;
      completed = true;
      if (unit !== 'seconds') totalVolume += nonNegative(set.weight) * Math.floor(nonNegative(set.reps));
    }
    if (completed) exerciseCount += 1;
  }
  const cardioMinutes = cardio.reduce((sum, item) => sum + item.minutes, 0);
  let elapsed = nonNegative(session.elapsedSeconds);
  if (!finite(session.elapsedSeconds) && session.startedAt && session.endedAt) {
    elapsed = nonNegative((new Date(session.endedAt) - new Date(session.startedAt)) / 1000);
  }
  // The session timer includes its cardio; subtract it before estimating strength work.
  const durationMinutes = Math.max(elapsed / 60, cardioMinutes);
  const strengthMinutes = completedSets > 0 ? Math.max(0, durationMinutes - cardioMinutes) : 0;
  const { weight, assumed } = effectiveWeight(profile, session);
  const strengthKcal = rounded(3.5 * 3.5 * weight / 200 * strengthMinutes);
  const cardioKcal = rounded(cardio.reduce((sum, item) => sum + item.kcal, 0));
  return {
    durationMinutes: rounded(durationMinutes), strengthMinutes: rounded(strengthMinutes), strengthKcal,
    cardioKcal, totalKcal: rounded(strengthKcal + cardioKcal), completedSets,
    totalVolume: rounded(totalVolume), exerciseCount, cardioMinutes: rounded(cardioMinutes),
    weightKg: weight, weightAssumed: assumed, recordedKcal: rounded(cardio.filter((item) => !item.estimated).reduce((sum, item) => sum + item.kcal, 0)),
    estimatedKcal: rounded(strengthKcal + cardio.filter((item) => item.estimated).reduce((sum, item) => sum + item.kcal, 0)),
    calorieNotice: `热量为估算或设备/手动记录值。MET 估算含静息消耗，使用${assumed ? '暂定' : ''}体重 ${weight} kg。`,
  };
}

function validDate(input) {
  if (input === null || input === undefined || input === '') return null;
  if (input instanceof Date) return Number.isFinite(input.getTime()) ? new Date(input) : null;
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [year, month, day] = input.split('-').map(Number);
    const result = new Date(year, month - 1, day);
    return result.getFullYear() === year && result.getMonth() === month - 1 && result.getDate() === day ? result : null;
  }
  const result = new Date(input);
  return Number.isFinite(result.getTime()) ? result : null;
}

// Use the device's local calendar; never split ISO UTC strings to determine a day.
export function localDateKey(date = new Date()) {
  const value = validDate(date);
  if (!value) return '';
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

export function getWeekRange(date = new Date()) {
  const start = validDate(date) ?? new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end, startKey: localDateKey(start), endKey: localDateKey(end) };
}

export function weeklySummary(sessions = [], profile = {}, date = new Date()) {
  const { start, end } = getWeekRange(date);
  const labels = ['一', '二', '三', '四', '五', '六', '日'];
  const days = labels.map((label, index) => {
    const day = new Date(start);
    day.setDate(day.getDate() + index);
    return { key: localDateKey(day), label, count: 0 };
  });
  const unique = new Map();
  for (const session of list(sessions)) {
    if (!session || session.status !== 'completed') continue;
    const when = validDate(session.startedAt);
    if (!when || when < start || when >= end) continue;
    const identity = session.id || session;
    if (!unique.has(identity)) unique.set(identity, session);
  }
  let minutes = 0;
  let kcal = 0;
  let volume = 0;
  for (const session of unique.values()) {
    const summary = summarizeSession(session, profile);
    minutes += summary.durationMinutes;
    kcal += summary.totalKcal;
    volume += summary.totalVolume;
    const day = days.find((item) => item.key === localDateKey(session.startedAt));
    if (day) day.count += 1;
  }
  return { sessions: unique.size, minutes: rounded(minutes), kcal: rounded(kcal), volume: rounded(volume), days };
}
