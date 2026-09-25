/* Destiny Player Chronicle // Force Power Suite v1.46
   Runtime enhancement: derives cards from the existing Force Powers field and persists
   spent/available state in the character sheet JSON without requiring a schema migration. */
(function(){
'use strict';
const S={spent:[], syncing:false};
const css=document.createElement('style');
css.textContent=`
#cs-force-suite-panel{grid-column:1/-1;border:1px solid #286d7d;background:rgba(2,24,33,.94);padding:12px;margin-top:4px}
.fps-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}
.fps-title{color:#9af1ff;font-size:13px;font-weight:bold;letter-spacing:1.7px}
.fps-meta{font-size:8px;color:#78bdc9;letter-spacing:.8px;margin-top:4px}
.fps-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px;margin-top:10px}
.fps-card{border:1px solid #33788a;background:#052631;padding:10px;min-height:88px;display:flex;flex-direction:column;justify-content:space-between;transition:.15s}
.fps-card.spent{filter:grayscale(1);opacity:.42;background:#101719;border-color:#39464a}
.fps-name{color:#dffcff;font-weight:bold;font-size:11px;letter-spacing:.9px}
.fps-copy{font-size:7px;color:#78aeb8;margin-top:5px;line-height:1.5}
.fps-actions{display:flex;gap:6px;margin-top:9px;flex-wrap:wrap}
.fps-btn{border:1px solid #398398;background:#082c38;color:#bdf8ff;padding:6px 8px;font-size:7px;font-weight:bold;letter-spacing:.6px;cursor:pointer}
.fps-btn:hover{background:#0d3d4c}.fps-btn.good{border-color:#4d8d67;color:#caffda}.fps-btn.warn{border-color:#876e39;color:#ffe6a4}
.fps-btn:disabled{opacity:.35;cursor:not-allowed}
.fps-recovery{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;padding-top:10px;border-top:1px solid #204f5c}
.fps-empty{color:#6fa4af;font-size:8px;line-height:1.6;margin-top:9px}
@media(max-width:640px){.fps-grid{grid-template-columns:1fr}.fps-recovery .fps-btn{flex:1 1 46%}}
`;
document.head.appendChild(css);

function powers(){
 const el=document.getElementById('cs-force-powers');
 if(!el)return[];
 return String(el.value||'').split(/\n|;/).map(v=>v.trim()).filter(Boolean);
}
function talents(){
 const el=document.getElementById('cs-talents');
 return String(el?.value||'').split(/\n|;/).map(v=>v.trim().toLowerCase()).filter(Boolean);
}
function keyFor(name,index){return name.toLowerCase()+'::'+index}
function entries(){
 const counts={};
 return powers().map(name=>{const n=counts[name.toLowerCase()]||0;counts[name.toLowerCase()]=n+1;return{name,index:n,key:keyFor(name,n)}})
}
function ensurePanel(){
 const force=document.getElementById('cs-force-powers');
 if(!force||document.getElementById('cs-force-suite-panel'))return;
 const field=force.closest('.cs-field');
 const grid=field?.parentElement;
 if(!grid)return;
 const panel=document.createElement('div');panel.id='cs-force-suite-panel';
 grid.insertBefore(panel,field.nextSibling);
}
function utfBonus(){
 try{
  const idx=(window.CS_SKILLS||[]).findIndex(x=>x[0]==='Use the Force');
  if(idx>=0){const t=document.getElementById('cs-skill-total-'+idx);if(t)return t.textContent}
 }catch(e){}
 return '—';
}
function markDirty(){
 if(S.syncing)return;
 if(typeof window.characterSheetChanged==='function')window.characterSheetChanged();
}
function render(){
 ensurePanel();
 const panel=document.getElementById('cs-force-suite-panel');if(!panel)return;
 const es=entries(), valid=new Set(es.map(e=>e.key));
 S.spent=S.spent.filter(k=>valid.has(k));
 const available=es.filter(e=>!S.spent.includes(e.key)).length;
 const fp=Math.max(0,Number(document.getElementById('cs-force-points')?.value||0));
 panel.style.display=es.length?'block':'none';
 if(!es.length){panel.innerHTML='';return}
 panel.innerHTML=`<div class="fps-head"><div><div class="fps-title">FORCE POWER SUITE</div><div class="fps-meta">${available} / ${es.length} AVAILABLE // USE THE FORCE ${utfBonus()} // FORCE POINTS ${fp}</div></div><div class="fps-meta">EACH LIST ENTRY IS A SEPARATE USE // DUPLICATES REMAIN INDEPENDENT</div></div><div class="fps-grid"></div><div class="fps-recovery"></div>`;
 const grid=panel.querySelector('.fps-grid');
 es.forEach((e,i)=>{
  const spent=S.spent.includes(e.key), card=document.createElement('div');card.className='fps-card'+(spent?' spent':'');
  card.innerHTML=`<div><div class="fps-name">${escapeHtml(e.name)}${es.filter(x=>x.name.toLowerCase()===e.name.toLowerCase()).length>1?' #'+(e.index+1):''}</div><div class="fps-copy">${spent?'SPENT // RECOVER BEFORE USING AGAIN':'AVAILABLE // CLICK USE POWER TO SPEND THIS USE'}</div></div><div class="fps-actions"><button type="button" class="fps-btn ${spent?'':'good'}" ${spent?'disabled':''}>USE POWER</button><button type="button" class="fps-btn">DETAILS</button></div>`;
  card.querySelectorAll('button')[0].onclick=()=>{if(!S.spent.includes(e.key)){S.spent.push(e.key);render();markDirty()}};
  card.querySelectorAll('button')[1].onclick=()=>{if(typeof window.openCharacterRulesReference==='function')window.openCharacterRulesReference(e.name,'force power')};
  grid.appendChild(card);
 });
 const rec=panel.querySelector('.fps-recovery');
 const add=(label,cls,fn,disabled=false)=>{const b=document.createElement('button');b.type='button';b.className='fps-btn '+(cls||'');b.textContent=label;b.disabled=disabled;b.onclick=fn;rec.appendChild(b)};
 add('REST 1 MINUTE / END ENCOUNTER','good',()=>recoverAll(),!S.spent.length);
 add('NATURAL 20 — USE THE FORCE','good',()=>recoverAll(),!S.spent.length);
 add('SPEND FORCE POINT — RECOVER ONE','warn',()=>recoverOne(true),!S.spent.length||fp<1);
 if(talents().some(t=>t.includes('force focus')))add('FORCE FOCUS — DC 15 SUCCESS','',()=>recoverOne(false),!S.spent.length);
}
function recoverAll(){if(!S.spent.length)return;S.spent=[];render();markDirty()}
function recoverOne(spendFP){
 const es=entries().filter(e=>S.spent.includes(e.key));if(!es.length)return;
 let msg='Choose the spent power to recover:\n'+es.map((e,i)=>(i+1)+'. '+e.name+(entries().filter(x=>x.name.toLowerCase()===e.name.toLowerCase()).length>1?' #'+(e.index+1):'')).join('\n');
 const raw=prompt(msg+'\n\nEnter number:','1');if(raw===null)return;
 const pick=es[Number(raw)-1];if(!pick)return;
 if(spendFP){
  const input=document.getElementById('cs-force-points'),fp=Number(input?.value||0);if(!input||fp<1)return;
  input.value=fp-1;
 }
 S.spent=S.spent.filter(k=>k!==pick.key);render();markDirty();
}
const oldCollect=window.collectCharacterSheet;
if(typeof oldCollect==='function')window.collectCharacterSheet=function(){
 const sheet=oldCollect.apply(this,arguments);sheet.forcePowerSuite={spent:[...S.spent]};sheet.version=Math.max(Number(sheet.version||1),2);return sheet;
};
const oldHydrate=window.hydrateCharacterSheet;
if(typeof oldHydrate==='function')window.hydrateCharacterSheet=function(sheet){
 S.syncing=true;S.spent=Array.isArray(sheet?.forcePowerSuite?.spent)?[...sheet.forcePowerSuite.spent]:[];
 const out=oldHydrate.apply(this,arguments);S.syncing=false;setTimeout(render,0);return out;
};
const oldRecalc=window.recalculateCharacterSheet;
if(typeof oldRecalc==='function')window.recalculateCharacterSheet=function(){const out=oldRecalc.apply(this,arguments);render();return out};
document.addEventListener('input',e=>{if(e.target?.id==='cs-force-powers'||e.target?.id==='cs-talents'||e.target?.id==='cs-force-points')setTimeout(render,0)});
setTimeout(render,0);
})();