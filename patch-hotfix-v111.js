(()=>{
  const xp=document.getElementById('cs-xp');
  if(xp){
    const label=xp.closest('.cs-field')?.querySelector('.cs-label');
    if(label) label.textContent='CREDITS';
    xp.placeholder='0';
    xp.title='Character credits';
  }

  let liveReloadTimer=null;
  try{
    window.destinyStarshipRealtimeChannel=destinySupabase
      .channel('destiny-starship-live-v111')
      .on('postgres_changes',{
        event:'*',
        schema:'public',
        table:'starship_sheets',
        filter:'lobby_key=eq.destiny-main'
      },()=>{
        clearTimeout(liveReloadTimer);
        liveReloadTimer=setTimeout(async()=>{
          if(currentChronicleUser && typeof window.loadSS==='function'){
            await window.loadSS();
            const status=document.getElementById('ss-status');
            if(status) status.textContent='LIVE SHIP UPDATE RECEIVED // '+new Date().toLocaleTimeString();
          }
        },120);
      })
      .subscribe(status=>{
        if(status==='SUBSCRIBED') console.log('[DESTINY STARSHIP v1.11] realtime synchronization active');
      });
  }catch(error){
    console.error('[DESTINY STARSHIP v1.11] realtime setup failed',error);
  }

  console.log('[DESTINY CHRONICLE v1.11] hotfix loaded');
})();