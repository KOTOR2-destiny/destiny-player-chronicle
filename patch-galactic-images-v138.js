(()=>{
'use strict';
const BUCKET='galactic-database-images';
const PROJECT_URL='https://wfknfmvtygxtnjxdcxoj.supabase.co';
function imageUrl(path){
 if(!path)return '';
 return PROJECT_URL+'/storage/v1/object/public/'+BUCKET+'/'+String(path).split('/').map(encodeURIComponent).join('/');
}
function imageMarkup(record){
 if(!record||!record.image_path)return '';
 const src=imageUrl(record.image_path);
 const alt=String(record.name||record.title||'Galactic Database image').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 return '<figure class="destiny-lore-image"><img src="'+src+'" alt="'+alt+'" loading="lazy" onerror="this.parentElement.remove()"></figure>';
}
function wrapRenderer(fnName,kind,idName,hostId){
 const original=window[fnName];
 if(typeof original!=='function')return;
 window[fnName]=function(){
  const result=original.apply(this,arguments);
  requestAnimationFrame(()=>{
   try{
    const host=document.getElementById(hostId);
    if(!host)return;
    host.querySelectorAll('.destiny-lore-image').forEach(x=>x.remove());
    const state=window.chronicleState||chronicleState;
    const id=window[idName]!==undefined?window[idName]:eval(idName);
    const record=(state?.[kind]||[]).find(x=>x.id===id);
    if(!record?.image_path)return;
    host.insertAdjacentHTML('afterbegin',imageMarkup(record));
   }catch(e){console.warn('Destiny lore image render failed',kind,e);}
  });
  return result;
 };
}
function install(){
 wrapRenderer('renderSelectedNpc','npcs','selectedNpcId','dossier');
 wrapRenderer('renderSelectedLocation','locations','selectedLocationId','location-dossier');
 wrapRenderer('renderSelectedFaction','factions','selectedFactionId','faction-dossier');
 wrapRenderer('renderSelectedMission','missions','selectedMissionId','mission-dossier');
 wrapRenderer('renderSelectedSession','sessions','selectedSessionId','session-dossier');
 wrapRenderer('renderSelectedDiscovery','discoveries','selectedDiscoveryId','discovery-dossier');
 try{renderSelectedNpc();renderSelectedLocation();renderSelectedFaction();renderSelectedMission();renderSelectedSession();renderSelectedDiscovery();}catch(e){}
}
const style=document.createElement('style');
style.textContent='.destiny-lore-image{margin:0 0 14px;padding:0}.destiny-lore-image img{display:block;width:auto;max-width:100%;max-height:440px;object-fit:contain;border:1px solid #327b8f;background:#02141d;box-shadow:0 0 16px rgba(49,217,255,.15)}';
document.head.appendChild(style);
install();
})();