/**
 * Fitlog's local database. Every write waits for the IndexedDB transaction to
 * commit. A storage error is surfaced to the caller; there is no memory fallback.
 * Browser / device storage can still be cleared, so offer regular JSON backups.
 */
const DB_NAME = 'fitlog-v1';
const DB_VERSION = 1;
const BACKUP_FORMAT = 'fitlog-backup';
const STORES = ['sessions', 'photos', 'settings', 'favorites'];
const MiB = 1024 * 1024;
const LIMITS = Object.freeze({
  sessions: 20000,
  photos: 2000,
  settings: 200,
  favorites: 5000,
  imageBytes: 12 * MiB,
  backupBytes: 150 * MiB,
  jsonBytes: 20 * MiB,
  recordBytes: MiB,
});
const IMAGE_TYPES = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
  'image/heic', 'image/heif', 'image/avif', 'image/bmp', 'image/x-ms-bmp',
]);
let opening;

function fail(message) {
  throw new Error(message);
}

function storageError(error) {
  if (error?.name === 'QuotaExceededError') {
    return new Error('设备存储空间不足。请先导出备份，再删除不需要的照片或训练记录。', { cause: error });
  }
  return error instanceof Error ? error : new Error('无法访问本机训练数据库。');
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(storageError(request.error));
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(storageError(transaction.error || new Error('本次保存已取消，原数据未被更改。')));
    transaction.onerror = () => { /* onabort reports the final error */ };
  });
}

export function initDB() {
  if (opening) return opening;
  opening = new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(new Error('此浏览器未提供本地数据库。请在 Safari 中打开，并允许网站保存数据。'));
      return;
    }
    let request;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (error) {
      reject(storageError(error));
      return;
    }
    let blockedTimer;
    let expired = false;
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains('sessions')) {
        const sessions = database.createObjectStore('sessions', { keyPath: 'id' });
        sessions.createIndex('startedAt', 'startedAt');
      }
      if (!database.objectStoreNames.contains('photos')) {
        const photos = database.createObjectStore('photos', { keyPath: 'id' });
        photos.createIndex('sessionId', 'sessionId');
      }
      if (!database.objectStoreNames.contains('settings')) database.createObjectStore('settings', { keyPath: 'key' });
      if (!database.objectStoreNames.contains('favorites')) database.createObjectStore('favorites', { keyPath: 'id' });
    };
    request.onblocked = () => {
      blockedTimer ||= setTimeout(() => {
        expired = true;
        reject(new Error('其他窗口正在使用旧版数据库。请关闭本 App 的其他窗口后重试。'));
      }, 8000);
    };
    request.onerror = () => {
      clearTimeout(blockedTimer);
      reject(storageError(request.error));
    };
    request.onsuccess = () => {
      clearTimeout(blockedTimer);
      const database = request.result;
      if (expired) {
        database.close();
        return;
      }
      database.onversionchange = () => {
        database.close();
        opening = undefined;
      };
      database.onclose = () => { opening = undefined; };
      resolve(database);
    };
  }).catch(error => {
    opening = undefined;
    throw storageError(error);
  });
  return opening;
}

async function withTransaction(names, mode, action) {
  const database = await initDB();
  let transaction;
  try {
    transaction = database.transaction(names, mode);
  } catch (error) {
    throw storageError(error);
  }
  const done = transactionDone(transaction);
  // Handle aborts immediately, even when another IDB request is being awaited.
  done.catch(() => {});
  try {
    const result = await action(transaction);
    await done;
    return result;
  } catch (error) {
    try { transaction.abort(); } catch { /* already completed or aborted */ }
    await done.catch(() => {});
    throw storageError(error);
  }
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function cleanText(value, label, max = 2000) {
  if (typeof value !== 'string') fail(`${label}必须是文字。`);
  if (value.length > max) fail(`${label}过长（最多 ${max} 字符）。`);
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
}

function identifier(value, label = '记录 ID') {
  const result = cleanText(value, label, 200).trim();
  if (!result) fail(`${label}不能为空。`);
  return result;
}

function jsonCopy(value, depth = 0, state = { nodes: 0 }) {
  if (depth > 14 || ++state.nodes > 30000) fail('记录结构过大或嵌套过深。');
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail('记录包含无效数字。');
    return value;
  }
  if (typeof value === 'string') return cleanText(value, '文字内容', 20000);
  if (Array.isArray(value)) {
    if (value.length > 20000) fail('记录包含过多条目。');
    return value.map(item => jsonCopy(item, depth + 1, state));
  }
  if (!isRecord(value)) fail('记录包含不支持的数据类型。');
  const result = {};
  for (const [key, item] of Object.entries(value)) {
    if (['__proto__', 'prototype', 'constructor'].includes(key)) fail('记录包含不安全的属性。');
    const safeKey = cleanText(key, '属性名', 150);
    if (safeKey !== key) fail('属性名含无效字符。');
    // JSON.stringify omits undefined object fields; preserve that useful behavior.
    if (item !== undefined) result[key] = jsonCopy(item, depth + 1, state);
  }
  return result;
}

function sizedJSON(value, limit = LIMITS.recordBytes) {
  const copy = jsonCopy(value);
  if (new TextEncoder().encode(JSON.stringify(copy)).length > limit) fail('单条记录体积过大。');
  return copy;
}

function validDate(value, label, fallback) {
  if (value === undefined || value === null || value === '') {
    if (fallback !== undefined) return fallback;
    fail(`${label}不能为空。`);
  }
  if ((typeof value !== 'string' && typeof value !== 'number') || !Number.isFinite(new Date(value).getTime())) {
    fail(`${label}格式无效。`);
  }
  return new Date(value).toISOString();
}

function normalizeSession(input) {
  if (!isRecord(input)) fail('训练记录格式无效。');
  const session = sizedJSON(input);
  session.id = identifier(session.id);
  session.startedAt = validDate(session.startedAt, '训练开始时间');
  if (session.photoIds === undefined) session.photoIds = [];
  if (!Array.isArray(session.photoIds) || session.photoIds.length > LIMITS.photos) fail('训练照片列表无效。');
  session.photoIds = [...new Set(session.photoIds.map(id => identifier(id, '照片 ID')))];
  return session;
}

function normalizeFavorite(input) {
  if (!isRecord(input)) fail('收藏格式无效。');
  const favorite = sizedJSON(input);
  favorite.id = identifier(favorite.id);
  favorite.title = cleanText(favorite.title || '健身教学', '收藏标题', 300);
  favorite.url = cleanText(favorite.url, '收藏链接', 4096).trim();
  let url;
  try { url = new URL(favorite.url); } catch { fail('请输入完整的教学视频网页链接。'); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) fail('收藏仅支持 http 或 https 网页链接。');
  favorite.url = url.href;
  favorite.platform = cleanText(favorite.platform || '其他', '平台名称', 60);
  if (favorite.exerciseId !== undefined && favorite.exerciseId !== null && favorite.exerciseId !== '') {
    favorite.exerciseId = identifier(favorite.exerciseId, '动作 ID');
  }
  favorite.createdAt = validDate(favorite.createdAt, '收藏时间', new Date().toISOString());
  return favorite;
}

function validateImage(blob, label) {
  if (!(blob instanceof Blob)) fail(`${label}必须是图片文件。`);
  if (!IMAGE_TYPES.has(blob.type.toLowerCase())) fail(`${label}格式暂不支持，请使用 JPEG、PNG、WebP 或 HEIC 等图片。`);
  if (!blob.size || blob.size > LIMITS.imageBytes) fail(`${label}需大于 0 且不超过 12 MB。`);
  return blob;
}

function normalizePhoto(input) {
  if (!isRecord(input)) fail('照片格式无效。');
  const { blob, thumbnail, ...metadata } = input;
  const photo = sizedJSON(metadata);
  photo.id = identifier(photo.id, '照片 ID');
  photo.sessionId = photo.sessionId === null || photo.sessionId === undefined || photo.sessionId === ''
    ? null : identifier(photo.sessionId, '训练 ID');
  photo.blob = validateImage(blob, '照片');
  if (thumbnail !== undefined && thumbnail !== null) photo.thumbnail = validateImage(thumbnail, '缩略图');
  photo.name = cleanText(photo.name || '训练照片', '照片名称', 300);
  photo.kind = cleanText(photo.kind || 'training', '照片用途', 60);
  photo.createdAt = validDate(photo.createdAt, '拍摄时间', new Date().toISOString());
  return photo;
}

async function enforceCount(store, id, max) {
  const existing = await requestResult(store.get(id));
  if (!existing && await requestResult(store.count()) >= max) fail(`本地记录数量已达上限（${max} 条），请先备份并清理旧记录。`);
  return existing;
}

export async function getSetting(key, fallback = null) {
  key = identifier(key, '设置名称');
  return withTransaction(['settings'], 'readonly', async tx => {
    const record = await requestResult(tx.objectStore('settings').get(key));
    return record ? record.value : fallback;
  });
}

export async function setSetting(key, value) {
  const setting = { key: identifier(key, '设置名称'), value: sizedJSON(value) };
  return withTransaction(['settings'], 'readwrite', async tx => {
    const store = tx.objectStore('settings');
    await enforceCount(store, setting.key, LIMITS.settings);
    await requestResult(store.put(setting));
    return setting.value;
  });
}

export async function getSessions() {
  return withTransaction(['sessions'], 'readonly', async tx => {
    const records = await requestResult(tx.objectStore('sessions').getAll());
    return records.sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
  });
}

export async function getSession(id) {
  id = identifier(id);
  return withTransaction(['sessions'], 'readonly', tx => requestResult(tx.objectStore('sessions').get(id)));
}

export async function saveSession(input) {
  const session = normalizeSession(input);
  return withTransaction(['sessions', 'photos'], 'readwrite', async tx => {
    const store = tx.objectStore('sessions');
    await enforceCount(store, session.id, LIMITS.sessions);
    // Photo ownership is authoritative. A stale screen must not reintroduce a
    // deleted photo ID or attach a photo that belongs to another session.
    const attached = await requestResult(tx.objectStore('photos').index('sessionId').getAll(session.id));
    session.photoIds = attached.map(photo => photo.id);
    await requestResult(store.put(session));
    return session;
  });
}

export async function deleteSession(id) {
  id = identifier(id);
  return withTransaction(['sessions', 'photos'], 'readwrite', async tx => {
    const sessions = tx.objectStore('sessions');
    const photos = tx.objectStore('photos');
    const [session, attached] = await Promise.all([
      requestResult(sessions.get(id)),
      requestResult(photos.index('sessionId').getAllKeys(id)),
    ]);
    const photoIds = new Set([...(session?.photoIds || []), ...attached]);
    await Promise.all([...photoIds].map(photoId => requestResult(photos.delete(photoId))));
    await requestResult(sessions.delete(id));
    // Clean up any stale references left by a previously imported record.
    if (photoIds.size) {
      const remaining = await requestResult(sessions.getAll());
      await Promise.all(remaining.filter(item => item.photoIds?.some(photoId => photoIds.has(photoId))).map(item => {
        item.photoIds = item.photoIds.filter(photoId => !photoIds.has(photoId));
        return requestResult(sessions.put(item));
      }));
    }
  });
}

export async function getPhoto(id) {
  id = identifier(id, '照片 ID');
  return withTransaction(['photos'], 'readonly', tx => requestResult(tx.objectStore('photos').get(id)));
}

export async function getPhotos(sessionId) {
  if (sessionId !== undefined && sessionId !== null) sessionId = identifier(sessionId, '训练 ID');
  return withTransaction(['photos'], 'readonly', async tx => {
    const photos = tx.objectStore('photos');
    const records = await requestResult(sessionId === undefined || sessionId === null
      ? photos.getAll() : photos.index('sessionId').getAll(sessionId));
    return records.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  });
}

export async function savePhoto(input) {
  const photo = normalizePhoto(input);
  return withTransaction(['photos', 'sessions'], 'readwrite', async tx => {
    const photos = tx.objectStore('photos');
    const sessions = tx.objectStore('sessions');
    const previous = await enforceCount(photos, photo.id, LIMITS.photos);
    if (previous?.sessionId && previous.sessionId !== photo.sessionId) {
      const oldSession = await requestResult(sessions.get(previous.sessionId));
      if (oldSession) {
        oldSession.photoIds = (oldSession.photoIds || []).filter(id => id !== photo.id);
        await requestResult(sessions.put(oldSession));
      }
    }
    if (photo.sessionId) {
      const session = await requestResult(sessions.get(photo.sessionId));
      if (!session) fail('请先保存本次训练，再添加照片。');
      session.photoIds = [...new Set([...(session.photoIds || []), photo.id])];
      await requestResult(sessions.put(session));
    }
    await requestResult(photos.put(photo));
    return photo;
  });
}

export async function deletePhoto(id) {
  id = identifier(id, '照片 ID');
  return withTransaction(['photos', 'sessions'], 'readwrite', async tx => {
    const sessions = tx.objectStore('sessions');
    const allSessions = await requestResult(sessions.getAll());
    await Promise.all(allSessions.filter(session => session.photoIds?.includes(id)).map(session => {
      session.photoIds = session.photoIds.filter(photoId => photoId !== id);
      return requestResult(sessions.put(session));
    }));
    await requestResult(tx.objectStore('photos').delete(id));
  });
}

export async function getFavorites() {
  return withTransaction(['favorites'], 'readonly', async tx => {
    const records = await requestResult(tx.objectStore('favorites').getAll());
    return records.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  });
}

export async function saveFavorite(input) {
  const favorite = normalizeFavorite(input);
  return withTransaction(['favorites'], 'readwrite', async tx => {
    const favorites = tx.objectStore('favorites');
    await enforceCount(favorites, favorite.id, LIMITS.favorites);
    await requestResult(favorites.put(favorite));
    return favorite;
  });
}

export async function deleteFavorite(id) {
  id = identifier(id);
  return withTransaction(['favorites'], 'readwrite', tx => requestResult(tx.objectStore('favorites').delete(id)));
}

async function blobToJSON(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return { type: blob.type, data: btoa(binary) };
}

function jsonToBlob(input, state) {
  if (!isRecord(input) || typeof input.type !== 'string' || !IMAGE_TYPES.has(input.type.toLowerCase())
    || typeof input.data !== 'string') fail('备份中的照片编码无效。');
  if (input.data.length > Math.ceil(LIMITS.imageBytes / 3) * 4
    || input.data.length % 4 !== 0
    || !/^[A-Za-z0-9+/]*={0,2}$/.test(input.data)) {
    fail('备份中的照片过大或 Base64 数据已损坏。');
  }
  let binary;
  try { binary = atob(input.data); } catch { fail('备份中的照片无法解码。'); }
  if (!binary.length || binary.length > LIMITS.imageBytes) fail('备份中的单张照片超过 12 MB。');
  state.bytes += binary.length;
  if (state.bytes > LIMITS.backupBytes) fail('备份照片总量超过 150 MB，请使用更小的备份文件。');
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: input.type.toLowerCase() });
}

export async function exportBackup() {
  const data = await withTransaction(STORES, 'readonly', async tx => {
    const entries = await Promise.all(STORES.map(name => requestResult(tx.objectStore(name).getAll())));
    return Object.fromEntries(STORES.map((name, index) => [name, entries[index]]));
  });
  const metadata = { ...data, photos: data.photos.map(({ blob, thumbnail, ...photo }) => photo) };
  if (new TextEncoder().encode(JSON.stringify(metadata)).length > LIMITS.jsonBytes) {
    fail('文字记录总量超过 20 MB，无法生成单个备份，请先清理部分旧记录。');
  }
  let totalBytes = 0;
  const photos = [];
  for (const photo of data.photos) {
    totalBytes += photo.blob.size + (photo.thumbnail?.size || 0);
    if (totalBytes > LIMITS.backupBytes) fail('照片总量超过 150 MB，无法生成单个备份。请先保存照片并清理部分旧照片。');
    const encoded = { ...photo, blob: await blobToJSON(photo.blob) };
    if (photo.thumbnail) encoded.thumbnail = await blobToJSON(photo.thumbnail);
    photos.push(encoded);
  }
  return { format: BACKUP_FORMAT, version: 1, exportedAt: new Date().toISOString(), ...data, photos };
}

function validateBackup(data) {
  if (!isRecord(data) || data.format !== BACKUP_FORMAT || data.version !== 1) fail('不支持此备份版本，请选择本 App 导出的 v1 备份。');
  const normalized = {};
  const state = { bytes: 0 };
  for (const name of STORES) {
    if (!Array.isArray(data[name]) || data[name].length > LIMITS[name]) fail(`备份中的 ${name} 列表无效或超出数量限制。`);
  }
  normalized.sessions = data.sessions.map(normalizeSession);
  normalized.favorites = data.favorites.map(normalizeFavorite);
  normalized.settings = data.settings.map(setting => {
    if (!isRecord(setting) || !Object.hasOwn(setting, 'value')) fail('备份设置格式无效。');
    return { key: identifier(setting.key, '设置名称'), value: sizedJSON(setting.value) };
  });
  // Decode every photo before opening the replacement transaction.
  normalized.photos = data.photos.map(photo => {
    if (!isRecord(photo)) fail('备份照片格式无效。');
    const { blob, thumbnail, ...metadata } = photo;
    return normalizePhoto({
      ...metadata,
      blob: jsonToBlob(blob, state),
      ...(thumbnail ? { thumbnail: jsonToBlob(thumbnail, state) } : {}),
    });
  });
  for (const name of STORES) {
    const key = name === 'settings' ? 'key' : 'id';
    const ids = normalized[name].map(record => record[key]);
    if (new Set(ids).size !== ids.length) fail(`备份中的 ${name} 含重复 ID。`);
  }
  const sessionById = new Map(normalized.sessions.map(session => [session.id, session]));
  const photoById = new Map(normalized.photos.map(photo => [photo.id, photo]));
  for (const session of normalized.sessions) {
    for (const id of session.photoIds) {
      const photo = photoById.get(id);
      if (!photo || photo.sessionId !== session.id) fail('备份中训练与照片的关联不完整，请使用完整备份。');
    }
  }
  for (const photo of normalized.photos) {
    if (photo.sessionId) {
      const session = sessionById.get(photo.sessionId);
      if (!session) fail('备份照片关联的训练记录不存在。');
      if (!session.photoIds.includes(photo.id)) session.photoIds.push(photo.id);
    }
  }
  const metadata = { ...normalized, photos: normalized.photos.map(({ blob, thumbnail, ...photo }) => photo) };
  if (new TextEncoder().encode(JSON.stringify(metadata)).length > LIMITS.jsonBytes) fail('备份中的文字记录总量超过 20 MB。');
  return normalized;
}

/** Entirely replaces local data only after validation; quota failures abort all stores. */
export async function importBackup(data) {
  const normalized = validateBackup(data);
  await withTransaction(STORES, 'readwrite', async tx => {
    // Queue clears and puts synchronously in one transaction. No half-imported DB.
    const requests = [];
    for (const name of STORES) {
      const store = tx.objectStore(name);
      requests.push(requestResult(store.clear()));
      for (const record of normalized[name]) requests.push(requestResult(store.put(record)));
    }
    await Promise.all(requests);
  });
  return Object.fromEntries(STORES.map(name => [name, normalized[name].length]));
}

export async function clearAllData() {
  return withTransaction(STORES, 'readwrite', tx => Promise.all(STORES.map(name => requestResult(tx.objectStore(name).clear()))));
}

export async function storageUsage() {
  if (!globalThis.navigator?.storage?.estimate) return null;
  try {
    const estimate = await navigator.storage.estimate();
    const persistent = navigator.storage.persisted ? await navigator.storage.persisted() : false;
    return { usage: estimate.usage || 0, quota: estimate.quota || 0, persistent };
  } catch { return null; }
}
