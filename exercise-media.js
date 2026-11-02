import {EXERCISE_DEMOS} from './exercise-media-catalog.js';

export const DEMO_CACHE = 'pingfit-exercise-media-v1';
const MAX_SAVED = 20;
const esc = v => String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const megabytes = bytes => `${(bytes/1024/1024).toFixed(1)} MB`;
export const getExerciseDemo = id => EXERCISE_DEMOS.find(d=>d.exerciseId===id);
export const demoCount = EXERCISE_DEMOS.length;

export function exerciseDemoHTML(id) {
  const demo = getExerciseDemo(id);
  if (!demo) return '';
  return `<section class="exercise-demo" data-exercise-demo="${esc(id)}">
    <div class="demo-heading"><h3>动作演示</h3><span>真人 · 可循环播放</span></div>
    <video class="demo-video" controls playsinline loop muted preload="none" poster="${esc(demo.poster)}" aria-label="${esc(demo.title)}动作演示"><source src="${esc(demo.src)}" type="video/mp4"></video>
    <p class="demo-feedback" role="status">点击播放查看动作，按播放器控件可全屏观看。</p>
    <button class="button soft small demo-save" type="button">保存离线观看 · ${megabytes(demo.bytes)}</button>
    <details class="demo-credit"><summary>素材来源与授权</summary><p>演示：${esc(demo.author)} · <a href="${esc(demo.sourceUrl)}" target="_blank" rel="noopener noreferrer">wger 原条目 ↗</a> · <a href="${esc(demo.licenseUrl)}" target="_blank" rel="noopener noreferrer">${esc(demo.license)} ↗</a></p><p>${esc(demo.modifications)} 演示素材及其修改按上述许可提供。</p></details>
  </section>`;
}

export function mountExerciseDemo(root) {
  const demo = getExerciseDemo(root.dataset.exerciseDemo);
  if (!demo) return ()=>{};
  const video = root.querySelector('video'), button = root.querySelector('.demo-save'), feedback = root.querySelector('.demo-feedback');
  const url = new URL(demo.src, location.href).href;
  let alive=true, saved=false, busy=false;
  const abort = new AbortController();
  const label = () => {if(alive){button.disabled=busy;button.textContent=busy?'正在保存…':saved?'移除离线视频':`保存离线观看 · ${megabytes(demo.bytes)}`;}};
  const say = value => {if(alive) feedback.textContent=value;};
  const available = 'caches' in window && window.isSecureContext && 'serviceWorker' in navigator;
  if (!available) {button.hidden=true;}
  else caches.open(DEMO_CACHE).then(cache=>cache.match(url)).then(hit=>{saved=Boolean(hit);label();}).catch(()=>{button.hidden=true;});
  const onError = () => say(saved?'视频暂时未能播放。请重新打开本页后再试，或移除后重新保存。':'视频加载失败。请联网后重试，动作步骤仍可查看。');
  video.addEventListener('error',onError);
  // Source failures do not consistently bubble to <video> in Safari.
  video.querySelector('source')?.addEventListener('error',onError);
  const onPlaying = () => say(saved?'已保存离线观看，可在播放器中暂停或全屏。':'可在播放器中暂停、拖动进度或全屏观看。');
  video.addEventListener('playing',onPlaying);
  const onClick = async () => {
    if (busy) return;
    busy=true;label();
    try {
      const cache=await caches.open(DEMO_CACHE);
      if (saved) {await cache.delete(url);saved=false;say('已移除离线视频，联网时仍可播放。');}
      else {
        // Wait for a controlling worker before claiming offline playback is ready.
        if (!navigator.serviceWorker.controller) {say('离线功能正在准备，请重新打开本页后再保存。');return;}
        const response=await fetch(url,{signal:abort.signal,cache:'reload'});
        if (!response.ok || response.status!==200 || !response.headers.get('Content-Type')?.includes('video/mp4')) throw new Error('download');
        const blob=await response.blob();
        if (blob.size!==demo.bytes) throw new Error('incomplete');
        const stored=new Response(blob,{status:200,headers:{'Content-Type':'video/mp4','Content-Length':String(blob.size),'Accept-Ranges':'bytes'}});
        await cache.put(url,stored);
        saved=true;
        const keys=await cache.keys();
        for(const key of keys.slice(0,Math.max(0,keys.length-MAX_SAVED))) await cache.delete(key);
        say('已保存离线观看。浏览器清理网站数据或空间不足时，需重新保存。');
      }
    } catch(error) {if(error.name!=='AbortError')say('保存未完成，请检查网络或手机可用空间后重试。');}
    finally {busy=false;label();}
  };
  button.addEventListener('click',onClick);
  const onVisibility=()=>{if(document.hidden)video.pause();};
  document.addEventListener('visibilitychange',onVisibility);
  return ()=>{alive=false;abort.abort();video.pause();video.removeAttribute('src');video.querySelector('source')?.removeAttribute('src');video.load();button.removeEventListener('click',onClick);video.removeEventListener('error',onError);video.removeEventListener('playing',onPlaying);document.removeEventListener('visibilitychange',onVisibility);};
}
