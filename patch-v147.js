/* Destiny Player Chronicle v1.47
   Eligibility-gated modular equipment prototype.
   Intentionally generic filename/content surface: no navigation or UI is created for ineligible characters. */
(()=>{
'use strict';
const ROOT_ID='destiny-v147-module';
const REQUIRED_FEAT='weapon proficiency (lightsabers)';
const families=['Temple','Guardian','Ancient'];
const slots=[
 ['Emitter',['Crown','Fork','Shroud']],
 ['Upper Hilt',['Ribbed','Collar','Filigree']],
 ['Grip',['Linear','Wrapped','Knurled']],
 ['Control',['Stud','Plate','Inset']],
 ['Lower Hilt',['Vented','Armored','Tapered']],
 ['Pommel',['Cap','Ring','Faceted']]
];
const state={choices:[0,0,0,0,0,0],blade:'#7eefff'};
function lines(v){return String(v||'').split(/\n|;/).map(x=>x.trim().toLowerCase()).filter(Boolean)}
function eligible(){
 const jedi=Number(document.getElementById('cs-class-jedi')?.value||0);
 const feats=lines(document.getElementById('cs-feats')?.value);
 return jedi>=1 && feats.some(f=>f===REQUIRED_FEAT || (f.includes('weapon proficiency')&&f.includes('lightsaber')));
}
function remove(){document.getElementById(ROOT_ID)?.remove()}
function markDirty(){if(typeof window.characterSheetChanged==='function')window.characterSheetChanged()}
function styleFor(slot,n){
 const accents=['#c9b06b','#aab7bd','#806b55'];
 const dark=['#27343a','#1d252a','#332b26'];
 const a=accents[n%3],d=dark[n%3];
 const common=`border-color:${a};background:linear-gradient(90deg,#56646a 0 12%,${d} 12% 22%,#b8c1c3 22% 29%,${a} 29% 35%,#58666a 35% 65%,${a} 65% 71%,#b8c1c3 71% 78%,${d} 78% 88%,#56646a 88%)`;
 if(slot===0)return common+`;clip-path:polygon(10% 0,90% 0,82% 100%,18% 100%)`;
 if(slot===1)return common+`;border-radius:7px`;
 if(slot===2)return `border-color:${a};background:repeating-linear-gradient(90deg,${d} 0 7px,#101619 7px 12px);`;
 if(slot===3)return `border-color:${a};background:linear-gradient(90deg,#66757a 0 38%,${a} 38% 45%,#11191d 45% 55%,${a} 55% 62%,#66757a 62%)`;
 if(slot===4)return common+`;border-radius:4px 4px 10px 10px`;
 return `border-color:${a};background:radial-gradient(circle at 50% 50%,${a} 0 12%,#1b2428 13% 27%,#89969a 28% 55%,${d} 56%);border-radius:0 0 18px 18px`;
}
function renderPreview(root){
 const p=root.querySelector('.v147-preview'); if(!p)return;
 p.innerHTML='<div class="v147-blade"></div>'+slots.map((s,i)=>`<div class="v147-part p${i}" style="${styleFor(i,state.choices[i])}"></div>`).join('');
 p.querySelector('.v147-blade').style.background=state.blade;
 p.querySelector('.v147-blade').style.boxShadow=`0 0 8px ${state.blade},0 0 24px ${state.blade},0 0 42px ${state.blade}`;
}
function renderControls(root){
 const c=root.querySelector('.v147-controls');c.innerHTML='';
 slots.forEach((s,i)=>{
  const box=document.createElement('div');box.className='v147-control';
  box.innerHTML=`<div class="v147-label">${s[0]}</div><div class="v147-row"></div>`;
  s[1].forEach((name,n)=>{
   const b=document.createElement('button');b.type='button';b.textContent=`${families[n]} // ${name}`;
   b.className=n===state.choices[i]?'active':'';
   b.onclick=()=>{state.choices[i]=n;renderControls(root);renderPreview(root);markDirty()};
   box.querySelector('.v147-row').appendChild(b);
  });c.appendChild(box);
 });
}
function ensure(){
 if(!eligible()){remove();return}
 if(document.getElementById(ROOT_ID))return;
 const anchor=document.querySelector('#character-sheet-section .cs-save-row');if(!anchor)return;
 const root=document.createElement('div');root.id=ROOT_ID;root.className='v147-shell';
 root.innerHTML=`<div class="v147-head"><div><div class="v147-title">ARTISAN WORKBENCH</div><div class="v147-sub">PERSONAL WEAPON CONSTRUCTION // OLD REPUBLIC COMPONENT STUDY</div></div></div><div class="v147-body"><div class="v147-preview"></div><div class="v147-controls"></div></div><div class="v147-colors"><span>ENERGY COLOR</span><input type="color" value="#7eefff"></div>`;
 anchor.parentNode.insertBefore(root,anchor);
 root.querySelector('input[type=color]').oninput=e=>{state.blade=e.target.value;renderPreview(root);markDirty()};
 renderControls(root);renderPreview(root);
}
const css=document.createElement('style');css.textContent=`
#${ROOT_ID}{border:1px solid #8c7844;background:radial-gradient(circle at top,#17232a,#070b0d 70%);padding:14px;box-shadow:inset 0 0 35px rgba(195,160,79,.08)}
.v147-head{display:flex;justify-content:space-between;border-bottom:1px solid #554a2e;padding-bottom:10px}.v147-title{color:#e5d39b;font-weight:bold;letter-spacing:2px}.v147-sub{color:#827a62;font-size:8px;letter-spacing:1px;margin-top:4px}.v147-body{display:grid;grid-template-columns:minmax(180px,280px) 1fr;gap:16px;margin-top:14px}.v147-preview{min-height:540px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:16px;background:linear-gradient(#050708,#10171a);border:1px solid #303a3d}.v147-blade{width:18px;height:185px;border-radius:12px 12px 2px 2px;margin-bottom:0}.v147-part{width:74px;height:52px;border:1px solid;box-shadow:inset 0 0 8px #000}.v147-part.p0{height:48px}.v147-part.p1{height:55px}.v147-part.p2{height:78px}.v147-part.p3{height:55px}.v147-part.p4{height:70px}.v147-part.p5{height:42px}.v147-controls{display:grid;gap:9px}.v147-control{border:1px solid #344247;background:#0b1215;padding:9px}.v147-label{font-size:8px;color:#c8b77f;letter-spacing:1.2px;margin-bottom:7px}.v147-row{display:flex;gap:6px;flex-wrap:wrap}.v147-row button{border:1px solid #45545a;background:#101a1e;color:#aebdc0;padding:7px;font-size:7px;cursor:pointer}.v147-row button.active{border-color:#c9b06b;color:#fff2c4;background:#292519}.v147-colors{margin-top:10px;display:flex;align-items:center;gap:10px;color:#a89b70;font-size:8px;letter-spacing:1px}@media(max-width:700px){.v147-body{grid-template-columns:1fr}.v147-preview{min-height:500px}}`;
document.head.appendChild(css);
const oldCollect=window.collectCharacterSheet;
if(typeof oldCollect==='function')window.collectCharacterSheet=function(){const sheet=oldCollect.apply(this,arguments);if(eligible())sheet.artisanModule={choices:[...state.choices],blade:state.blade};return sheet};
const oldHydrate=window.hydrateCharacterSheet;
if(typeof oldHydrate==='function')window.hydrateCharacterSheet=function(sheet){const out=oldHydrate.apply(this,arguments);if(sheet?.artisanModule&&eligible()){state.choices=(sheet.artisanModule.choices||state.choices).map((x)=>Math.max(0,Math.min(2,Number(x)||0)));state.blade=sheet.artisanModule.blade||state.blade}setTimeout(ensure,0);return out};
document.addEventListener('input',e=>{if(e.target?.id==='cs-class-jedi'||e.target?.id==='cs-feats')setTimeout(ensure,0)});
document.addEventListener('change',e=>{if(e.target?.id==='cs-class-jedi'||e.target?.id==='cs-feats')setTimeout(ensure,0)});
setInterval(()=>{if(document.getElementById('character-sheet-section'))ensure()},1200);
})();
