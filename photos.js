/** Photos stay on this device. Recognition uses the bundled Tesseract worker. */
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const OCR_BASE = new URL('./vendor/tesseract/', import.meta.url);
let recognitionQueue = Promise.resolve();

function imageError(message, code = 'IMAGE_ERROR') {
  const error = new Error(message);
  error.code = code;
  return error;
}

function assertImage(file) {
  if (!(file instanceof Blob)) throw imageError('请选择一张图片。', 'INVALID_IMAGE');
  if (file.size > MAX_UPLOAD_BYTES) throw imageError('图片超过 20 MB，请先压缩后再试。', 'IMAGE_TOO_LARGE');
  if (!file.size) throw imageError('图片是空文件，请重新选择。', 'INVALID_IMAGE');
  const name = typeof file.name === 'string' ? file.name : '';
  if (!file.type.startsWith('image/') && !(!file.type && /\.(jpe?g|png|webp|gif|heic|heif|avif|bmp)$/i.test(name))) {
    throw imageError('只支持图片文件，请选择照片或截图。', 'INVALID_IMAGE');
  }
  if (file.type.includes('svg') || /\.svg$/i.test(name)) {
    throw imageError('请选择 JPG、PNG、HEIC 等照片格式。', 'INVALID_IMAGE');
  }
}

async function decodeImage(blob) {
  // HTMLImageElement follows EXIF orientation in current iOS Safari and browsers.
  // Keeping this path also avoids createImageBitmap's inconsistent HEIC support.
  const image = new Image();
  const url = URL.createObjectURL(blob);
  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(imageError('无法读取这张图片。请尝试 JPG 或 PNG 格式。', 'IMAGE_DECODE_FAILED'));
      image.src = url;
    });
    if (!image.naturalWidth || !image.naturalHeight) throw imageError('图片尺寸无效。', 'IMAGE_DECODE_FAILED');
    if (image.naturalWidth * image.naturalHeight > 100_000_000) {
      throw imageError('图片尺寸过大，请先缩小后再试。', 'IMAGE_TOO_LARGE');
    }
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function resizedCanvas(image, maxEdge, allowUpscale = false) {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const scale = allowUpscale ? maxEdge / Math.max(width, height) : Math.min(1, maxEdge / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw imageError('当前浏览器无法处理图片，请在 Safari 中重新打开。');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function jpegBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(imageError('图片压缩失败，请换一张图片。')), 'image/jpeg', quality);
  });
}

/** @returns {{blob: Blob, thumbnail: Blob, width: number, height: number, name: string, mimeType: string}} */
export async function preparePhoto(file) {
  assertImage(file);
  const image = await decodeImage(file);
  const canvas = resizedCanvas(image, 1600);
  const thumbnailCanvas = resizedCanvas(image, 400);
  const [blob, thumbnail] = await Promise.all([jpegBlob(canvas, 0.84), jpegBlob(thumbnailCanvas, 0.76)]);
  return {
    blob,
    thumbnail,
    width: canvas.width,
    height: canvas.height,
    name: (typeof file.name === 'string' && file.name) || '训练照片.jpg',
    mimeType: 'image/jpeg',
  };
}

function normalizedText(value) {
  return String(value || '').normalize('NFKC').replace(/[：]/g, ':').replace(/[，]/g, ',').replace(/\r\n?/g, '\n');
}

function decimal(value) {
  return Number(String(value).replace(',', '.'));
}

function round(value, places = 2) {
  return Math.round(value * 10 ** places) / 10 ** places;
}

/** Extract only values present in OCR text. Distances are kilometres; weight is kg. */
export function parseWorkoutText(value) {
  const text = normalizedText(value);
  const fields = {};
  const num = '(\\d{1,5}(?:[.,]\\d{1,3})?)(?![\\d.,:])';
  const separator = '[\\s:=—–-]*';
  const match = pattern => text.match(new RegExp(pattern, 'i'));
  const assign = (key, number, max) => {
    if (Number.isFinite(number) && number >= 0 && number <= max) fields[key] = round(number);
  };
  const clock = '(\\d{1,3}\\s*:\\s*\\d{2}(?:\\s*:\\s*\\d{2})?)';
  let duration = match(`(?:\\bTIME\\b|\\bDURATION\\b|\\bELAPSED\\b|运动时长|运动时间|用时|时间|时长)${separator}${clock}`);
  if (!duration) {
    // A lone clock is useful on equipment screens, but a pace (6:00 min/km) is not a duration.
    const clocks = [...text.matchAll(/\b(\d{1,3}\s*:\s*\d{2}(?:\s*:\s*\d{2})?)\b/g)].filter(item => {
      const after = text.slice(item.index + item[0].length, item.index + item[0].length + 15);
      const before = text.slice(Math.max(0, item.index - 12), item.index);
      return !/^\s*(?:min\s*\/\s*km|\/\s*km|分\s*\/\s*公里)/i.test(after)
        && !/(?:pace|speed|dist(?:ance)?|calories|weight|配速|速度|距离|重量)\s*[:=]?\s*$/i.test(before);
    });
    if (clocks.length === 1) duration = clocks[0];
  }
  if (duration) {
    const parts = duration[1].replace(/\s/g, '').split(':').map(Number);
    const valid = parts.at(-1) < 60 && (parts.length !== 3 || parts[1] < 60);
    if (valid) assign('minutes', parts.length === 3 ? parts[0] * 60 + parts[1] + parts[2] / 60 : parts[0] + parts[1] / 60, 1440);
  }
  if (!('minutes' in fields)) {
    const minutes = match(`${num}\\s*(?:minutes?\\b|mins?\\b|分钟)(?!\\s*[/／])`)
      || match(`(?:\\bTIME\\b|\\bDURATION\\b|时长|用时|时间)${separator}${num}(?![\\d.,:]|\\s*:)`);
    if (minutes) assign('minutes', decimal(minutes[1]), 1440);
  }
  const distance = match(`(?:\\bDIST(?:ANCE)?\\b|里程|距离)${separator}${num}\\s*(km|kilometers?|公里|千米|miles?|mi\\b|meters?\\b|m\\b|米)?`);
  if (distance) {
    const unit = (distance[2] || 'km').toLowerCase();
    const multiplier = /^(?:miles?|mi)$/.test(unit) ? 1.609344 : /^(?:meters?|m|米)$/.test(unit) ? 0.001 : 1;
    assign('distance', decimal(distance[1]) * multiplier, 500);
  } else {
    const unitDistance = match(`${num}\\s*(km\\b|kilometers?\\b|公里|千米|miles?\\b|mi\\b)(?!\\s*(?:[/／]\\s*h|per\\s*hour|每小时))`);
    if (unitDistance) assign('distance', decimal(unitDistance[1]) * (/^(?:mi|mile)/i.test(unitDistance[2]) ? 1.609344 : 1), 500);
  }
  const calories = match(`(?:\\bK?CAL(?:ORIES)?\\b|热量|卡路里|消耗)${separator}${num}`)
    || match(`${num}\\s*(?:kcal\\b|cals?\\b|calories\\b|千卡|大卡)`);
  if (calories) assign('kcal', decimal(calories[1]), 10000);
  const weight = match(`${num}\\s*(kg\\b|kgs\\b|公斤|千克|lbs?\\b|磅)`)
    || match(`(?:\\bWEIGHT\\b|重量)${separator}${num}`);
  if (weight) assign('weight', decimal(weight[1]) * (/^(?:lbs?|磅)$/i.test(weight[2] || '') ? 0.45359237 : 1), 1000);
  const reps = match(`(?:\\bREPS?\\b|次数)${separator}${num}`)
    || match(`${num}\\s*(?:reps?\\b|次)`)
    || match(`(?:kg|kgs|公斤|千克|lbs?)\\s*[x×*]\\s*${num}\\b`);
  if (reps) {
    const count = decimal(reps[1]);
    if (Number.isInteger(count)) assign('reps', count, 1000);
  }
  return fields;
}

const EQUIPMENT = [
  { name: '腿举机', ids: ['leg-press'], pattern: /\bleg\s*press\b|腿举|蹬腿机/i },
  { name: '高位下拉器械', ids: ['lat-pulldown'], pattern: /\blat\s*pull[ -]?down\b|\bpulldown\b|高位下拉/i },
  { name: '坐姿划船器械', ids: [], pattern: /\bseated\s*row\b|\blow\s*row\b|坐姿划船(?!高位)/i },
  { name: '坐姿高位划船器械', ids: ['high-row'], pattern: /\bhigh\s*row\b|高位划船/i },
  { name: '推胸器械', ids: ['machine-chest-press'], pattern: /\bchest\s*press\b|推胸/i },
  { name: '推肩器械', ids: ['machine-shoulder-press'], pattern: /\bshoulder\s*press\b|\boverhead\s*press\b|推肩/i },
  { name: '腿屈伸器械', ids: [], pattern: /\bleg\s*extension\b|腿屈伸|腿伸展/i },
  { name: '腿弯举器械', ids: ['hamstring-curl'], pattern: /\bleg\s*curl\b|腿弯举/i },
  { name: '史密斯机', ids: [], pattern: /\bsmith(?:\s*machine)?\b|史密斯/i },
  { name: '跑步机', ids: [], pattern: /\btreadmill\b|跑步机/i },
  { name: '椭圆机', ids: [], pattern: /\belliptical\b|\bcross\s*trainer\b|椭圆机/i },
  { name: '动感单车', ids: [], pattern: /\b(?:exercise|stationary|spin|upright|recumbent)\s*bike\b|\bcycling\b|动感单车|健身单车/i },
  { name: '划船机', ids: [], pattern: /\browing\s*machine\b|\brower\b|划船机/i },
];

/** Matches text labels only, never claims to recognise equipment appearance. */
export function matchEquipment(value) {
  const text = normalizedText(value);
  const matches = EQUIPMENT.filter(item => item.pattern.test(text));
  return {
    suggestedExerciseIds: [...new Set(matches.flatMap(item => item.ids))],
    equipmentName: matches.map(item => item.name).join('、') || undefined,
  };
}

async function recognitionCanvas(blob, mode) {
  const image = await decodeImage(blob);
  const canvas = resizedCanvas(image, Math.min(2200, Math.max(image.naturalWidth, image.naturalHeight) * 1.25), true);
  if (mode !== 'screen') return canvas;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  let total = 0;
  let samples = 0;
  for (let i = 0; i < pixels.data.length; i += 64) {
    total += pixels.data[i] * 0.299 + pixels.data[i + 1] * 0.587 + pixels.data[i + 2] * 0.114;
    samples++;
  }
  const invert = total / samples < 115;
  for (let i = 0; i < pixels.data.length; i += 4) {
    let gray = pixels.data[i] * 0.299 + pixels.data[i + 1] * 0.587 + pixels.data[i + 2] * 0.114;
    if (invert) gray = 255 - gray;
    gray = Math.max(0, Math.min(255, (gray - 128) * 1.25 + 128));
    pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = gray;
  }
  context.putImageData(pixels, 0, 0);
  return canvas;
}

/** Real, on-device English/numeric OCR; rejects on failure, never substitutes demo data. */
export function recognizeWorkoutImage(blob, { onProgress, mode = 'screen' } = {}) {
  const run = async () => {
    assertImage(blob);
    if (typeof Worker === 'undefined' || typeof WebAssembly === 'undefined') {
      throw imageError('当前浏览器不支持本地文字识别，请手动录入。', 'OCR_UNSUPPORTED');
    }
    let worker;
    let finished = false;
    let rejectFailure;
    const failure = new Promise((_, reject) => { rejectFailure = reject; });
    const timeout = setTimeout(() => rejectFailure(imageError('图片识别超时，请缩小图片或手动录入。', 'OCR_TIMEOUT')), 60000);
    const progress = data => {
      if (typeof onProgress === 'function') {
        // Rendering a progress indicator must not be able to interrupt the OCR worker.
        try { onProgress(data); } catch { /* caller handles its own UI errors */ }
      }
    };
    try {
      progress({ status: '准备图片', progress: 0 });
      const canvas = await recognitionCanvas(blob, mode);
      const { default: Tesseract } = await import('./vendor/tesseract/tesseract.esm.min.js');
      const workerReady = Tesseract.createWorker('eng', 1, {
        workerPath: new URL('worker.min.js', OCR_BASE).href,
        corePath: new URL('core/', OCR_BASE).href.replace(/\/$/, ''),
        langPath: new URL('lang/', OCR_BASE).href.replace(/\/$/, ''),
        workerBlobURL: false,
        gzip: true,
        legacyCore: false,
        legacyLang: false,
        cacheMethod: 'write',
        logger: progress,
        errorHandler: () => rejectFailure(imageError('本地文字识别未完成，请重新尝试或手动录入。', 'OCR_FAILED')),
      });
      workerReady.then(lateWorker => {
        if (finished) lateWorker.terminate().catch(() => {});
      }).catch(() => {});
      worker = await Promise.race([workerReady, failure]);
      worker.worker.onerror = () => rejectFailure(imageError('识别进程已停止，请重新尝试或手动录入。', 'OCR_FAILED'));
      await Promise.race([worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
        preserve_interword_spaces: '1',
        user_defined_dpi: '150',
      }), failure]);
      const { data } = await Promise.race([worker.recognize(canvas), failure]);
      const text = String(data.text || '').trim();
      if (!text) throw imageError('没有读到清晰文字。请正面拍摄屏幕或器械铭牌，或手动录入。', 'OCR_NO_TEXT');
      const equipment = matchEquipment(text);
      progress({ status: '识别完成，请核对', progress: 1 });
      return {
        text,
        fields: parseWorkoutText(text),
        ...equipment,
        method: '本地文字识别（英文与数字）',
        confidence: Number.isFinite(data.confidence) ? Math.round(data.confidence) : undefined,
        needsConfirmation: true,
        note: equipment.equipmentName
          ? '器械候选来自图片中的文字，请核对器械、单位与数值后保存。'
          : '未能从文字判断器械，请手动选择。请核对单位与数值后保存。',
      };
    } catch (error) {
      if (error.code) throw error;
      throw imageError('本地文字识别未完成，请重新尝试或手动录入。首次使用请保持网络连接，确保识别资源已下载。', 'OCR_FAILED');
    } finally {
      finished = true;
      clearTimeout(timeout);
      if (worker) await worker.terminate().catch(() => {});
    }
  };
  // A single worker at a time limits memory pressure on an iPhone.
  const task = recognitionQueue.then(run, run);
  recognitionQueue = task.catch(() => {});
  return task;
}
