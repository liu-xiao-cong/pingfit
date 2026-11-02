import {EXERCISE_DEMOS} from './exercise-media-catalog.js';
import {ONLINE_EXERCISE_DEMOS} from './exercise-online-catalog.js';

export const DEMO_CACHE = 'pingfit-exercise-media-v1';
const MAX_SAVED = 20;
const esc = v => String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const megabytes = bytes => `${(bytes/1024/1024).toFixed(1)} MB`;
export const getExerciseDemo = id => EXERCISE_DEMOS.find(d=>d.exerciseId===id)||ONLINE_EXERCISE_DEMOS.find(d=>d.exerciseId===id);
export const offlineDemoCount = EXERCISE_DEMOS.length;
export const onlineDemoCount = ONLINE_EXERCISE_DEMOS.length;
export const demoCount = offlineDemoCount+onlineDemoCount;

// Keep every iframe on a reviewed video endpoint; catalogue values never become arbitrary HTML.
export function getEmbedUrl(demo) {
  if (!demo?.embedUrl) return '';
  let url;try{url=new URL(demo.embedUrl);}catch{return '';}
  if(url.protocol!=='https:'||url.username||url.password||url.port||url.hash)return '';
  if(demo.provider==='youtube'&&url.hostname==='www.youtube-nocookie.com'&&/^\/embed\/[A-Za-z0-9_-]{11}$/.test(url.pathname)){
    url.searchParams.set('autoplay','0');url.searchParams.set('playsinline','1');url.searchParams.set('rel','0');
    if(Number.isInteger(demo.startSeconds)&&demo.startSeconds>=0&&demo.startSeconds<86400)url.searchParams.set('start',String(demo.startSeconds));
    if(Number.isInteger(demo.endSeconds)&&demo.endSeconds>(demo.startSeconds||0)&&demo.endSeconds<86400)url.searchParams.set('end',String(demo.endSeconds));
    return url.href;
  }
  return '';
}

function onlineDemoHTML(demo) {
  const canEmbed=Boolean(getEmbedUrl(demo));
  return `<section class="exercise-demo online-demo" data-exercise-demo="${esc(demo.exerciseId)}">
    <div class="demo-heading"><h3>视频教学</h3><span>联网播放</span></div>
    <div class="online-player" data-online-player><div class="online-video-cover"><span class="online-play-symbol" aria-hidden="true">▶</span><strong>${esc(demo.title)}</strong><span>${esc(demo.author)}</span>${canEmbed?'<button type="button" class="button lime small" data-load-online>加载教学视频</button>':`<a class="button lime small" href="${esc(demo.watchUrl)}" target="_blank" rel="noopener noreferrer">观看原站视频 ↗</a>`}</div></div>
    <p class="demo-feedback" role="status">${canEmbed?'点击后加载原作者播放器，需要联网。':'该视频请在原作者页面观看，需要联网。'}${demo.note?` ${esc(demo.note)}`:''}</p>
    <a class="text-link online-watch-link" href="${esc(demo.watchUrl)}" target="_blank" rel="noopener noreferrer">在${esc(demo.providerLabel||'原平台')}打开视频 ↗</a>
    <details class="demo-credit"><summary>视频来源</summary><p>作者：${esc(demo.author)} · ${esc(demo.videoTitle)}</p><p>使用原平台播放器或原站观看，不提供下载或离线保存。</p>${demo.nonEndorsement?`<p>${esc(demo.nonEndorsement)}</p>`:''}<a href="${esc(demo.sourceUrl)}" target="_blank" rel="noopener noreferrer">查看原作者发布页 ↗</a></details>
  </section>`;
}

export function exerciseDemoHTML(id) {
  const demo = getExerciseDemo(id);
  if (!demo) return '';
  if (demo.kind==='online') return onlineDemoHTML(demo);
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
  if (demo.kind==='online') return mountOnlineDemo(root,demo);
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

function mountOnlineDemo(root,demo) {
  const button=root.querySelector('[data-load-online]'),player=root.querySelector('[data-online-player]'),feedback=root.querySelector('.demo-feedback');
  let frame=null;
  const load=()=>{
    if(!navigator.onLine){feedback.textContent='当前离线，联网后可加载这段教学。动作步骤仍可查看。';return;}
    const src=getEmbedUrl(demo);if(!src)return;
    frame=document.createElement('iframe');frame.src=src;frame.className='online-video-frame';frame.title=`${demo.title} · ${demo.author} 视频教学`;
    frame.allow='autoplay; fullscreen; picture-in-picture; encrypted-media';frame.allowFullscreen=true;
    // YouTube requires a referrer; no-referrer would cause player error 153.
    frame.referrerPolicy='strict-origin-when-cross-origin';
    player.replaceChildren(frame);
    feedback.textContent=`在原平台播放器中点击播放。若播放器无法显示，可点下方“在${demo.providerLabel||'原平台'}打开视频”。${demo.note?' '+demo.note:''}`;
  };
  button?.addEventListener('click',load);
  // Removing a frame stops playback when closing the modal or putting the app in the background.
  const stop=()=>{if(frame){frame.remove();frame=null;player.replaceChildren();const resume=document.createElement('button');resume.type='button';resume.className='button soft small';resume.textContent='重新加载视频';resume.addEventListener('click',load);player.append(resume);}};
  const visibility=()=>{if(document.hidden)stop();};
  document.addEventListener('visibilitychange',visibility);
  return ()=>{button?.removeEventListener('click',load);document.removeEventListener('visibilitychange',visibility);frame?.remove();frame=null;};
}
