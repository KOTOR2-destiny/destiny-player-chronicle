(()=>{
  const crew=document.getElementById('ss-crew-result');
  const damage=document.getElementById('ss-damage-result');
  if(!crew&&!damage)return;

  function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function show(title,text){
    if(!text||/NO CREW ACTION RESOLVED|NO DAMAGE RESOLVED|COMBAT STATE RESET/.test(text))return;
    if(typeof openCharacterModal==='function'){
      openCharacterModal(title,`<div class="cs-roll-result" style="font-size:1.25rem;line-height:1.6;letter-spacing:.5px">${esc(text)}</div>`,'');
    }
  }
  function watch(el,title){
    if(!el)return;
    let last=el.textContent;
    new MutationObserver(()=>{
      const now=el.textContent.trim();
      if(now&&now!==last){last=now;show(title,now);}
    }).observe(el,{childList:true,subtree:true,characterData:true});
  }

  watch(crew,'STARSHIP CREW ACTION RESULT');
  watch(damage,'STARSHIP COMBAT RESULT');
  console.log('[DESTINY STARSHIP v1.9.1] popup roll results loaded');
})();