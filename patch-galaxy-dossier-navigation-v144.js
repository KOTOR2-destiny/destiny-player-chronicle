(()=>{'use strict';
// The map's original handler writes window.selectedLocationId, while the Chronicle
// owns its selection in a top-level lexical binding. Use the normal location-card
// interaction instead, so its selection, list, and dossier all update together.
document.addEventListener('click',event=>{
 const button=event.target.closest?.('#galaxy-open-record');
 if(!button)return;
 const panel=button.closest('#galaxy-panel');
 const name=panel?.querySelector('h2')?.textContent?.trim();
 if(!name)return;
 event.preventDefault();event.stopImmediatePropagation();
 window.showChronicleSection('locations');
 const select=()=>{
  const cards=[...document.querySelectorAll('#location-section .location-card, .location-section .location-card')];
  const card=cards.find(c=>c.querySelector('.location-name')?.textContent?.trim()===name);
  if(!card)return false;
  card.click();return true;
 };
 if(select())return;
 // The location list can be populated asynchronously after section navigation.
 const root=document.getElementById('location-section')||document.querySelector('.location-section');
 if(!root)return;
 const observer=new MutationObserver(()=>{if(select())observer.disconnect()});
 observer.observe(root,{subtree:true,childList:true});
 setTimeout(()=>observer.disconnect(),5000);
},true);
})();