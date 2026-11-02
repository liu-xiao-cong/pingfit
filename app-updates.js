// Updating the app shell never clears the user's IndexedDB or saved exercise videos.
import {APP_VERSION} from './app-version.js';
export {APP_VERSION} from './app-version.js';

export function mountAppUpdates({beforeUpdate=async()=>{},onOfflineReady=()=>{}}={}) {
  const serviceWorker=navigator.serviceWorker;
  if(!serviceWorker)return {ready:Promise.resolve(null),checkForUpdate:async()=>false,destroy:()=>{}};
  const banner=document.createElement('section'),message=document.createElement('span'),button=document.createElement('button');
  banner.id='app-update-banner';banner.className='app-update-banner';banner.hidden=true;
  banner.setAttribute('role','status');banner.setAttribute('aria-live','polite');
  button.type='button';button.className='button lime small';
  banner.append(message,button);
  const header=document.querySelector('#app-header');
  if(header)header.before(banner);else document.body.prepend(banner);
  let registration=null,waitingWorker=null,busy=false,applying=false,reloadReady=false,destroyed=false,reloading=false,applyTimer=null;
  const hadController=Boolean(serviceWorker.controller),seenWorkers=new Set(),removers=[];
  const listen=(target,type,handler)=>{target.addEventListener(type,handler);removers.push(()=>target.removeEventListener(type,handler));};
  const show=(text,label)=>{if(destroyed)return;banner.hidden=false;message.textContent=text;button.textContent=label;button.disabled=busy;};
  const waiting=worker=>{if(!worker||destroyed)return;waitingWorker=worker;if(!busy)show('新版已准备好，更新后可查看最新教学。','更新并打开');};
  const watchWorker=worker=>{
    if(!worker||seenWorkers.has(worker))return;
    seenWorkers.add(worker);
    const changed=()=>{
      if(destroyed)return;
      if(worker.state==='installed'){
        if(serviceWorker.controller)waiting(registration?.waiting||worker);
        else onOfflineReady();
      }else if(worker.state==='redundant'&&waitingWorker===worker){
        waitingWorker=null;
        if(!busy)show('新版未能准备完成，请重新检查。','重试检查');
      }
    };
    listen(worker,'statechange',changed);changed();
  };
  const reload=()=>{if(destroyed||reloading)return;reloading=true;clearTimeout(applyTimer);window.location.reload();};
  const controllerChanged=()=>{
    if(destroyed)return;
    if(applying){reload();return;}
    // Another tab may activate an update. Never reload this tab's unsaved form.
    if(hadController){reloadReady=true;if(!busy)show('新版已就绪，保存当前进度后打开。','更新并打开');}
  };
  listen(serviceWorker,'controllerchange',controllerChanged);
  const ready=Promise.resolve().then(()=>serviceWorker.register('./sw.js',{updateViaCache:'none'})).then(reg=>{
    registration=reg;
    if(destroyed)return reg;
    if(reg.waiting)waiting(reg.waiting);
    listen(reg,'updatefound',()=>watchWorker(reg.installing));
    watchWorker(reg.installing);
    return reg;
  }).catch(error=>{if(!destroyed)show('暂时无法检查更新，请联网后重试。','重试检查');return null;});

  async function checkForUpdate(){
    if(destroyed||busy)return false;
    busy=true;show('正在检查新版…','检查中…');
    try{
      if(navigator.onLine===false)throw new Error('当前离线，请联网后再检查。');
      let reg=await ready;
      // A failed initial registration must be retryable after the network recovers.
      if(!reg){reg=await serviceWorker.register('./sw.js',{updateViaCache:'none'});registration=reg;if(destroyed)return false;listen(reg,'updatefound',()=>watchWorker(reg.installing));}
      await reg.update();
      if(destroyed)return false;
      busy=false;
      if(reg.waiting){waiting(reg.waiting);return true;}
      watchWorker(reg.installing);
      if(waitingWorker){waiting(waitingWorker);return true;}
      if(reloadReady)show('新版已就绪，保存当前进度后打开。','更新并打开');
      else if(reg.installing)show('新版正在下载，准备完成后会在这里提示。','再次检查');
      else show(`当前已是最新版本 · ${APP_VERSION}`,'再次检查');
      return false;
    }catch(error){if(!destroyed){busy=false;show(error?.message||'检查更新未完成，请重试。','重试检查');}return false;}
    finally{if(!destroyed){busy=false;button.disabled=false;}}
  }
  async function apply(){
    if(destroyed||busy)return;
    if(!waitingWorker&&!registration?.waiting&&!reloadReady){await checkForUpdate();return;}
    busy=true;show('正在保存当前进度…','正在保存…');
    try{
      await beforeUpdate();
      if(destroyed)return;
      if(reloadReady){reload();return;}
      const worker=registration?.waiting||waitingWorker;
      if(!worker||worker.state==='redundant')throw new Error('新版尚未准备好，请重新检查。');
      applying=true;show('正在打开新版…','更新中…');
      applyTimer=setTimeout(()=>{if(destroyed)return;applying=false;busy=false;show('更新尚未完成，请重试打开。','重试更新');},15000);
      worker.postMessage('SKIP_WAITING');
    }catch(error){clearTimeout(applyTimer);applying=false;if(!destroyed){busy=false;show(error?.message||'当前进度尚未保存，请重试。','重试更新');}}
  }
  listen(button,'click',apply);
  return {ready,checkForUpdate,destroy:()=>{
    if(destroyed)return;destroyed=true;clearTimeout(applyTimer);for(const remove of removers)remove();banner.remove();
  }};
}
