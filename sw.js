const CACHE="fitlog-b67f9d1c9d31";const MEDIA_CACHE='pingfit-exercise-media-v1';const ASSETS=["./","./SOURCES.md","./app.js","./assets/cover-cardio.jpg","./assets/cover-strength.jpg","./assets/exercise-demos/README.md","./assets/exercise-demos/barbell-bench-press.jpg","./assets/exercise-demos/catalog.json","./assets/exercise-demos/dumbbell-bench-press.jpg","./assets/exercise-demos/dumbbell-romanian-deadlift.jpg","./assets/exercise-demos/hammer-curl.jpg","./assets/exercise-demos/hamstring-curl.jpg","./assets/exercise-demos/incline-press.jpg","./assets/exercise-demos/seated-cable-row.jpg","./assets/training-hero.jpg","./cover-carousel.js","./db.js","./domain.js","./exercise-media-catalog.js","./exercise-media.js","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png","./icons/icon.svg","./index.html","./manifest.webmanifest","./photos.js","./style.css","./training-ui.js","./training.js","./validation.js","./vendor/tesseract/LICENSE-tesseract.md","./vendor/tesseract/LICENSE-worker.txt","./vendor/tesseract/README.md","./vendor/tesseract/core/LICENSE","./vendor/tesseract/core/tesseract-core-lstm.wasm.js","./vendor/tesseract/core/tesseract-core-simd-lstm.wasm.js","./vendor/tesseract/lang/LICENSE","./vendor/tesseract/lang/eng.traineddata.gz","./vendor/tesseract/tesseract.esm.min.js","./vendor/tesseract/worker.min.js"];
function parseMediaRange(header, size) {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || !Number.isSafeInteger(size) || size < 1 || (!match[1] && !match[2])) return {invalid:true};
  let start, end;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix < 1) return {invalid:true};
    start = Math.max(0, size - suffix); end = size - 1;
  } else {
    start = Number(match[1]); end = match[2] ? Number(match[2]) : size - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || start > end) return {invalid:true};
    end = Math.min(end, size - 1);
  }
  return {start,end};
}
async function mediaRangeResponse(response, header) {
  if (!header) return response;
  const blob = await response.blob();
  const range = parseMediaRange(header, blob.size);
  if (range.invalid) return new Response(null, {status:416,headers:{'Content-Range':`bytes */${blob.size}`}});
  const headers = new Headers(response.headers);
  headers.set('Content-Range', `bytes ${range.start}-${range.end}/${blob.size}`);
  headers.set('Content-Length', String(range.end - range.start + 1));
  headers.set('Accept-Ranges', 'bytes');
  return new Response(blob.slice(range.start,range.end+1,blob.type), {status:206,headers});
}
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('fitlog-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{const r=event.request;const url=new URL(r.url);if(r.method!=='GET'||url.origin!==location.origin)return;
if(url.pathname.includes('/assets/exercise-demos/')&&url.pathname.endsWith('.mp4')){event.respondWith((async()=>{const cache=await caches.open(MEDIA_CACHE);const saved=await cache.match(r.url);if(saved)return mediaRangeResponse(saved,r.headers.get('range'));try{return await fetch(r);}catch{return new Response('Video unavailable offline',{status:503});}})());return;}
event.respondWith((async()=>{const cache=await caches.open(CACHE);const hit=await cache.match(r);if(hit)return hit;try{const response=await fetch(r);if(response.ok&&response.status===200)await cache.put(r,response.clone());return response;}catch{if(r.mode==='navigate')return await cache.match('./index.html');return new Response('Offline',{status:503});}})());});