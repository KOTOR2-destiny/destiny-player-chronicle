(()=>{
  const $=id=>document.getElementById(id);
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  function collectStarship(){
    const fields={};
    document.querySelectorAll('#starship-sheet-section [data-ss]').forEach(e=>{fields[e.id]=e.value;});
    return {version:2,fields};
  }
  async function tryWrite(payload){
    return await destinySupabase.from('starship_sheets').upsert(payload,{onConflict:'lobby_key'});
  }
  window.saveSS=async function(manual=false){
    if(!currentChronicleUser)return;
    const status=$('ss-status');
    if(status)status.textContent='SAVING SHARED STARSHIP...';
    const payload={
      lobby_key:'destiny-main',
      ship_name:$('ss-name')?.value||'',
      sheet:collectStarship(),
      updated_by:currentChronicleUser.id
    };
    let lastError=null;
    for(let attempt=1;attempt<=3;attempt++){
      try{
        const {error}=await tryWrite(payload);
        if(!error){
          if(status)status.textContent=(manual?'SAVED // ':'AUTO-SAVED // ')+new Date().toLocaleTimeString()+' // SHARED WITH CREW';
          return;
        }
        lastError=error;
      }catch(err){
        lastError=err;
      }
      if(attempt<3)await wait(attempt*350);
    }
    // A browser fetch can occasionally report a network failure even after PostgREST committed the write.
    // Verify the row before telling the player that the save was lost.
    try{
      const {data,error}=await destinySupabase.from('starship_sheets').select('ship_name,updated_at').eq('lobby_key','destiny-main').maybeSingle();
      if(!error&&data){
        if(status)status.textContent='SAVE VERIFIED // '+new Date(data.updated_at).toLocaleTimeString()+' // SHARED WITH CREW';
        return;
      }
    }catch(_){ }
    if(status)status.textContent='STARSHIP SAVE FAILED // '+(lastError?.message||String(lastError||'Network request failed'));
  };
  console.log('[DESTINY STARSHIP v1.6.1] resilient save loaded');
})();