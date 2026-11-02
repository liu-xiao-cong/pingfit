// Standalone recovery entry: never removes IndexedDB or offline video caches.
const button=document.querySelector('#update-button'),status=document.querySelector('#update-status');
let busy=false,redirected=false;
const say=text=>{status.textContent=text;};
function openApp(){
  if(redirected)return;redirected=true;
  const url=new URL('./',location.href);url.searchParams.set('updated',String(Date.now()));url.hash='train';
  say('更新完成，正在打开包含视频的动作库…');location.replace(url.href);
}
function waitForInstall(reg){
  if(reg.waiting)return Promise.resolve(reg.waiting);
  if(!reg.installing)return Promise.resolve(null);
  return new Promise((resolve,reject)=>{
    const worker=reg.installing;
    const timer=setTimeout(()=>finish(new Error('下载时间较长，请保持网络后重试。')),45000);
    const finish=(error,value)=>{clearTimeout(timer);worker.removeEventListener('statechange',changed);error?reject(error):resolve(value);};
    const changed=()=>{if(worker.state==='installed')finish(null,reg.waiting||worker);else if(worker.state==='redundant')finish(new Error('新版资源没有下载完整，请联网重试。'));else if(worker.state==='activated')finish(null,null);};
    worker.addEventListener('statechange',changed);changed();
  });
}
button.addEventListener('click',async()=>{
  if(busy)return;
  if(!navigator.onLine){say('当前离线，请联网后再次更新。');return;}
  if(!('serviceWorker' in navigator)){say('此浏览器不支持应用更新。请用 Safari 打开此链接。');return;}
  busy=true;button.disabled=true;button.textContent='正在更新…';
  let controllerChanged;
  try{
    say('正在检查并下载新版动作与视频入口…');
    const reg=await navigator.serviceWorker.register(new URL('./sw.js',location.href),{updateViaCache:'none'});
    if(!reg.waiting&&!reg.installing)await reg.update();
    const worker=reg.waiting||await waitForInstall(reg);
    if(!worker||worker.state==='activated'||navigator.serviceWorker.controller===worker){openApp();return;}
    await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error('应用切换尚未完成，请重试。')),15000);
      controllerChanged=()=>{clearTimeout(timer);resolve();};
      navigator.serviceWorker.addEventListener('controllerchange',controllerChanged,{once:true});
      worker.postMessage('SKIP_WAITING');
    });
    openApp();
  }catch(error){say(error.message||'更新没有完成，请联网后再试。');}
  finally{if(controllerChanged)navigator.serviceWorker.removeEventListener('controllerchange',controllerChanged);busy=false;if(!redirected){button.disabled=false;button.textContent='重新更新并查看视频';}}
});
