import {summarizeSession,summarizeCardio,PARTS,EXERCISES} from './domain.js';
import {trainingHighlights} from './training.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=v=>new Intl.NumberFormat('zh-CN',{maximumFractionDigits:1}).format(v);
const valid=set=>set?.done===true&&Number.isFinite(Number(set.reps))&&Number(set.reps)>0;
export function buildTrainingRecap(session,sessions=[],profile={}){
 if(session?.status!=='completed')return null;
 const sum=summarizeSession(session,profile),cardio=(session.cardio||[]).map(c=>summarizeCardio(c,profile,session));
 const active=sum.completedSets>0||cardio.some(c=>c.minutes>0);
 let warmup=0,work=0;const parts=new Map();
 for(const e of session.exercises||[]){const done=(e.sets||[]).filter(valid);const formal=done.filter(t=>t.kind!=='warmup').length;warmup+=done.length-formal;work+=formal;const part=e.part||EXERCISES.find(d=>d.id===e.exerciseId)?.part;if(formal&&part)parts.set(part,(parts.get(part)||0)+formal);}
 const highlights=trainingHighlights(session,sessions);
 const comparisons=highlights.comparisons.filter(c=>c.previous).map(c=>({...c,change:c.unit==='seconds'?c.current.bestSeconds-c.previous.bestSeconds:c.volumeDelta}));
 const known=!sum.weightAssumed;
 const recorded=cardio.filter(c=>!c.estimated).reduce((n,c)=>n+c.kcal,0);
 const hasRecorded=cardio.some(c=>!c.estimated);
 const hasEstimate=sum.strengthMinutes>0||cardio.some(c=>c.estimated&&c.minutes>0);
 const strengthTimeKnown=!sum.completedSets||sum.strengthMinutes>0;
 const total=active&&sum.durationMinutes>0&&strengthTimeKnown&&(!hasEstimate||known)?sum.totalKcal:null;
 const tips=[];
 if(active&&(!sum.durationMinutes||!strengthTimeKnown))tips.push('本条记录缺少可用于力量估算的运动时长。请核对总时长与有氧时长，再查看完整消耗。');
 if(!active)tips.push('这条记录没有已完成组或有效有氧时长。先补全训练内容，再看消耗与训练表现。');
 if(!known&&hasEstimate)tips.push('本条记录缺少已确认体重，估算热量暂不展示。可在个人设置完善体重，或补充有氧设备的热量读数。');
 if(work){
  if(session.feeling==='有些吃力')tips.push('你记录了“有些吃力”。下次先用能稳定控制的重量；若动作开始变形，减少重量或次数。');
  else tips.push('下次先参考相同动作、相同器械的记录；动作稳定且完成起来更轻松后，再小幅调整重量或次数。');
  tips.push('给本次训练部位留出恢复时间，避免连续两天高强度练同一肌群；下次可按自己的计划轮换部位。');
 }else if(warmup)tips.push('目前只记录了热身组，暂不据此判断正式训练是否进步；如果做了正式组，可在修改记录中补齐。');
 if(cardio.some(c=>c.minutes>0))tips.push('下次使用同一有氧项目和相近强度记录时长、距离与感受，便于比较；热量读数用于参考。');
 if(work&&!comparisons.length)tips.push('本次已建立训练基线。积累同器械的正式组记录后，再看重量、次数或保持时长的变化。');
 return {sum,active,known,work,warmup,parts:[...parts].map(([id,sets])=>({label:PARTS.find(p=>p.id===id)?.label||'其他',sets})),comparisons,total,recorded,hasRecorded,hasEstimate,hasEstimatedCardio:cardio.some(c=>c.estimated&&c.minutes>0),strength:known&&sum.strengthMinutes>0?sum.strengthKcal:null,cardioEstimated:known?cardio.filter(c=>c.estimated).reduce((n,c)=>n+c.kcal,0):null,tips};
}
export function trainingRecapHTML(session,sessions,profile){
 const r=buildTrainingRecap(session,sessions,profile);if(!r)return '';
 const kcal=v=>v===null?'待完善数据':`${number(Math.round(v))} kcal`;
 const compare=r.comparisons.length?r.comparisons.slice(0,3).map(c=>`${esc(c.name)}：${c.unit==='seconds'?`最佳保持时长 ${c.change>0?'+':''}${number(c.change)} 秒`:`正式组训练量 ${c.change>0?'+':''}${number(c.change)} kg`}`).join('；'):'暂无可比的上次正式组记录。';
 return `<section class="training-recap"><div class="recap-heading"><h3>本次训练复盘</h3><span>本地规则分析</span></div><p class="recap-total">${r.total===null?'已记录部分':'本次总消耗'} <strong>${r.total===null?(r.hasRecorded?kcal(r.recorded):'待完善数据'):kcal(r.total)}</strong></p><div class="recap-energy"><div><span>力量估算</span><b>${r.sum.completedSets?kcal(r.strength):'无力量记录'}</b></div><div><span>有氧设备 / 手填</span><b>${r.hasRecorded?kcal(r.recorded):'未录入'}</b></div><div><span>有氧估算</span><b>${r.hasEstimatedCardio?kcal(r.cardioEstimated):'未使用估算'}</b></div></div><p class="recap-caption">${r.known?`估算使用体重 ${number(r.sum.weightKg)} kg；`:'缺少已确认体重，估算部分隐藏；'}MET 为粗估，包含静息消耗；设备和手填值也不等于精确测量。${r.total===null?'已记录部分不代表整次训练总消耗。':''}</p><div class="recap-block"><h4>训练结构与对比</h4><p>${r.work} 组正式组 · ${r.warmup} 组热身${r.parts.length?` · ${r.parts.map(p=>`${esc(p.label)} ${p.sets} 组`).join(' / ')}`:''}</p><p>${compare}</p><small>对比仅使用此前同一动作、器械与计量方式的正式组；训练量变化不能单独判断效果。</small></div><div class="recap-block"><h4>恢复与下次安排</h4><ul>${r.tips.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div><details class="recap-method"><summary>分析依据与局限</summary><p>按已保存记录实时计算，修改记录后会重新生成。这是本地规则复盘，未调用云端 AI，也不会上传训练或照片。不判断动作是否标准，不生成诊断，也不把运动热量换算为减脂量或建议补吃的热量。</p><a href="https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/weight-training/art-20045842" target="_blank" rel="noopener noreferrer">训练与恢复参考：Mayo Clinic ↗</a></details></section>`;
}
