// Original geometric illustration; no external exercise images or video frames are used.
export const EXERCISE_SCHEMATICS = [{
  exerciseId:'diagonal-raise',kind:'schematic',title:'哑铃斜向抬举',author:'PingFit',
  sourceUrl:'https://www.acefitness.org/resources/everyone/exercise-library/371/diagonal-raise/',
  note:'正面单侧路径示意：从对侧大腿前抬向同侧外方，约肩高后沿原路放回。身体保持朝前。此为简化动画，真人教学待补充。',
}];

export function schematicHTML(){
  return `<section class="exercise-demo schematic-demo" data-exercise-demo="diagonal-raise">
    <div class="demo-heading"><h3>动作示意</h3><span>原创动画 · 非真人教学</span></div>
    <svg class="motion-schematic" viewBox="0 0 420 350" role="img" aria-label="正面单臂示意：哑铃从对侧大腿前斜向抬到同侧肩高，躯干保持正对前方">
      <path d="M75 320H380" stroke="#ccd7c4" stroke-width="2"/>
      <path d="M163 238A132 132 0 0 0 365 125" fill="none" stroke="#a8bd90" stroke-width="2" stroke-dasharray="5 6"/>
      <path d="M140 125H385" stroke="#cbd5c5" stroke-dasharray="4 5"/>
      <text x="290" y="105">终点：约肩高</text><text x="63" y="260">起点：对侧大腿前</text>
      <circle cx="210" cy="66" r="23" fill="#dce5d3" stroke="#64765a" stroke-width="3"/>
      <path d="M184 117Q210 99 236 117L230 215H190Z" fill="#e1eacb" stroke="#64765a" stroke-width="3"/>
      <path d="M190 215L181 310M230 215L239 310M181 310H166M239 310H254M184 123L172 211" fill="none" stroke="#64765a" stroke-width="13" stroke-linecap="round"/>
      <g class="schematic-arm" transform="rotate(122 235 125)">
        <path d="M235 125L295 128L365 125" fill="none" stroke="#446b37" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M365 111V139M357 111H373M357 139H373" stroke="#293f22" stroke-width="7" stroke-linecap="round"/>
        <animateTransform attributeName="transform" type="rotate" values="122 235 125;0 235 125;0 235 125;122 235 125" keyTimes="0;0.45;0.55;1" dur="5s" begin="indefinite" repeatCount="indefinite"/>
      </g>
      <circle cx="235" cy="125" r="7" fill="#c3e969" stroke="#446b37" stroke-width="2"/>
      <text x="175" y="342">正面 · 单臂</text>
    </svg>
    <div class="schematic-controls"><button type="button" class="button lime small" data-schematic-play aria-pressed="false">播放示意</button><button type="button" class="button soft small" data-schematic-reset>回到起点</button></div>
    <p class="demo-feedback" role="status">${EXERCISE_SCHEMATICS[0].note}</p>
    <details class="demo-credit"><summary>示意说明</summary><p>图形与动画由 PingFit 原创绘制，简化展示动作路径，不展示肩关节旋转等全部细节。请结合下方步骤练习。</p><a href="${EXERCISE_SCHEMATICS[0].sourceUrl}" target="_blank" rel="noopener noreferrer">ACE 动作说明 ↗</a></details>
  </section>`;
}

export function mountSchematic(root){
  const svg=root.querySelector('svg'),animation=root.querySelector('animateTransform'),arm=root.querySelector('.schematic-arm'),play=root.querySelector('[data-schematic-play]'),reset=root.querySelector('[data-schematic-reset]');
  let started=false,playing=false;
  const label=()=>{play.textContent=playing?'暂停示意':'播放示意';play.setAttribute('aria-pressed',String(playing));};
  const pause=()=>{svg.pauseAnimations();playing=false;label();};
  const toggle=()=>{if(playing)pause();else{if(!started){animation.beginElement();started=true;}svg.unpauseAnimations();playing=true;label();}};
  const rewind=()=>{animation.endElement();arm.setAttribute('transform','rotate(122 235 125)');started=false;playing=false;label();};
  const visibility=()=>{if(document.hidden)pause();};
  play.addEventListener('click',toggle);reset.addEventListener('click',rewind);document.addEventListener('visibilitychange',visibility);
  return ()=>{pause();animation.endElement();play.removeEventListener('click',toggle);reset.removeEventListener('click',rewind);document.removeEventListener('visibilitychange',visibility);};
}
