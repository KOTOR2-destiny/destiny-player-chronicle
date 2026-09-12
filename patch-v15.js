(()=>{
  const $=id=>document.getElementById(id);
  const signed=n=>(n>=0?'+':'')+n;

  // Species presets: keep core species and correct the KotOR Campaign Guide set.
  Object.assign(CS_SPECIES,{
    'Arkanian':{mods:{int:2,cha:-2},speed:6,sizeRef:0,fort:0,will:0,note:'+2 INT, -2 CHA.'},
    'Arkanian Offshoot':{mods:{con:-2},speed:6,sizeRef:0,fort:0,will:0,note:'+2 STR OR +2 DEX, -2 CON. Put the chosen +2 in that ability\'s OTHER field.'},
    'Cathar':{mods:{dex:2,int:-2},speed:6,sizeRef:0,fort:0,will:0,note:'+2 DEX, -2 INT.'},
    'Draethos':{mods:{con:2,cha:-2},speed:6,sizeRef:0,fort:0,will:0,note:'+2 CON, -2 CHA.'},
    'Feeorin':{mods:{str:2,con:2,dex:-2,wis:-2,cha:-2},speed:6,sizeRef:0,fort:0,will:0,note:'+2 STR, +2 CON, -2 DEX, -2 WIS, -2 CHA.'},
    'Khil':{mods:{int:2,cha:2,con:-2},speed:6,sizeRef:0,fort:0,will:0,note:'+2 INT, +2 CHA, -2 CON.'},
    'Kissai':{mods:{cha:2,wis:-2},speed:6,sizeRef:0,fort:0,will:0,note:'+2 CHA, -2 WIS.'},
    'Massassi':{mods:{str:4,int:-2,wis:-2,cha:-2},speed:6,sizeRef:0,fort:0,will:0,note:'+4 STR, -2 INT, -2 WIS, -2 CHA.'},
    'Miraluka':{mods:{int:2,dex:-2},speed:6,sizeRef:0,fort:0,will:0,note:'+2 INT, -2 DEX.'},
    'Rakata':{mods:{int:2,wis:-2},speed:6,sizeRef:0,fort:0,will:0,note:'+2 INT, -2 WIS.'},
    'Selkath':{mods:{cha:2},speed:6,sizeRef:0,fort:0,will:0,note:'+2 CHA.'},
    'Snivvian':{mods:{wis:2},speed:6,sizeRef:0,fort:0,will:0,note:'+2 WIS.'}
  });
  delete CS_SPECIES.Nagai;

  const speciesSelect=$('cs-species');
  if(speciesSelect){
    const current=speciesSelect.value;
    const order=['Human',"Twi'lek",'Wookiee','Kel Dor','Bothan','Rodian','Jawa','Ewok','Ithorian','Gamorrean','Arkanian','Arkanian Offshoot','Cathar','Draethos','Feeorin','Khil','Kissai','Massassi','Miraluka','Rakata','Selkath','Snivvian'];
    speciesSelect.innerHTML=order.map(v=>`<option>${v}</option>`).join('')+'<option value="Custom">Custom / Other</option>';
    if([...speciesSelect.options].some(o=>o.value===current)) speciesSelect.value=current;
  }

  // Make final ability totals large/readable while preserving correct arithmetic.
  const oldRecalc=recalculateCharacterSheet;
  recalculateCharacterSheet=function(){
    oldRecalc();
    CS_ABILITIES.forEach(([key])=>{
      const btn=$(`cs-${key}-final`);
      if(!btn)return;
      const score=getAbilityScore(key);
      const mod=csAbilityMod(score);
      btn.textContent=`${score} (${signed(mod)})`;
      btn.style.minWidth='98px';
      btn.style.minHeight='54px';
      btn.style.fontSize='25px';
      btn.style.fontWeight='900';
      btn.style.lineHeight='1';
      btn.title=`Final ${key.toUpperCase()} ${score}; check modifier ${signed(mod)}`;
    });
  };
  recalculateCharacterSheet();

  // Shared Starship tab.
  if(!$('nav-starship')){
    const b=document.createElement('button');
    b.id='nav-starship'; b.className='nav-button'; b.textContent='STARSHIP CHARACTER SHEET';
    b.onclick=()=>showChronicleSection('starship');
    $('nav-character').insertAdjacentElement('afterend',b);
  }

  if(!$('starship-sheet-section')){
    const section=document.createElement('div');
    section.id='starship-sheet-section'; section.className='character-sheet-section'; section.style.display='none';
    section.innerHTML=`<div class="cs-shell">
      <div class="cs-panel"><div class="cs-title">SHARED STARSHIP CHARACTER SHEET</div><div class="cs-subtitle">SAGA EDITION // ONE LIVE SHIP RECORD SHARED BY THE CREW</div>
      <div class="cs-grid" style="margin-top:10px">
        <div class="cs-field"><div class="cs-label">SHIP NAME</div><input id="ss-name" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">MODEL / TYPE</div><input id="ss-model" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">CAPTAIN</div><input id="ss-captain" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">STR</div><input id="ss-str" type="number" value="10" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">DEX</div><input id="ss-dex" type="number" value="10" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">INT</div><input id="ss-int" type="number" value="10" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">SIZE MODIFIER</div><input id="ss-size" type="number" value="0" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">ARMOR BONUS</div><input id="ss-armor" type="number" value="0" class="cs-input" data-ss></div>
      </div></div>
      <div class="cs-panel"><div class="section-title">LIVE SHIP STATUS</div><div class="cs-stat-strip">
        <div class="cs-stat">REFLEX<b id="ss-ref">10</b></div><div class="cs-stat">FORTITUDE<b id="ss-fort">10</b></div>
        <div class="cs-stat">DT<input id="ss-dt" type="number" value="0" class="cs-input" data-ss></div>
        <div class="cs-stat">HP<input id="ss-hp" type="number" value="0" class="cs-input" data-ss> / <input id="ss-maxhp" type="number" value="0" class="cs-input" data-ss></div>
        <div class="cs-stat">DR<input id="ss-dr" type="number" value="0" class="cs-input" data-ss></div>
        <div class="cs-stat">SR<input id="ss-sr" type="number" value="0" class="cs-input" data-ss> / <input id="ss-maxsr" type="number" value="0" class="cs-input" data-ss></div>
      </div></div>
      <div class="cs-two-column"><div class="cs-panel"><div class="section-title">CREW / COMBAT</div><div class="cs-grid">
        <div class="cs-field"><div class="cs-label">PILOT</div><input id="ss-pilot" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">PILOT SKILL MOD</div><input id="ss-pilotmod" type="number" value="0" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">PILOT HEROIC LEVEL</div><input id="ss-level" type="number" value="0" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">GUNNER BAB</div><input id="ss-bab" type="number" value="0" class="cs-input" data-ss></div>
      </div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="cs-roll-button" onclick="rollSS('pilot')">ROLL PILOT</button><button class="cs-roll-button" onclick="rollSS('initiative')">ROLL INITIATIVE</button><button class="cs-roll-button" onclick="rollSS('attack')">ROLL VEHICLE ATTACK</button></div></div>
      <div class="cs-panel"><div class="section-title">SHIP DETAILS</div><div class="cs-grid">
        <div class="cs-field"><div class="cs-label">CREW</div><input id="ss-crew" class="cs-input" data-ss></div><div class="cs-field"><div class="cs-label">PASSENGERS</div><input id="ss-passengers" class="cs-input" data-ss></div><div class="cs-field"><div class="cs-label">CARGO</div><input id="ss-cargo" class="cs-input" data-ss></div><div class="cs-field"><div class="cs-label">CONSUMABLES</div><input id="ss-consumables" class="cs-input" data-ss></div><div class="cs-field"><div class="cs-label">HYPERDRIVE</div><input id="ss-hyperdrive" class="cs-input" data-ss></div>
      </div><div class="cs-label" style="margin-top:8px">WEAPONS / UPGRADES / NOTES</div><textarea id="ss-notes" class="cs-textarea" data-ss></textarea></div></div>
      <div class="cs-panel"><div id="ss-status" class="cs-save-status">SHARED STARSHIP // WAITING FOR LOGIN</div><button class="cs-roll-button" onclick="saveSS(true)">SAVE SHARED STARSHIP</button></div>
    </div>`;
    $('character-sheet-section').insertAdjacentElement('beforebegin',section);
  }

  let ssRecord=null,ssTimer=null,ssHydrate=false;
  const ssN=id=>Number($(id)?.value||0)||0;
  window.recalcSS=function(){
    if(!$('ss-ref'))return;
    $('ss-ref').textContent=10+ssN('ss-size')+Math.max(ssN('ss-level'),ssN('ss-armor'))+csAbilityMod(ssN('ss-dex'));
    $('ss-fort').textContent=10+csAbilityMod(ssN('ss-str'));
  };
  const collectSS=()=>{const fields={};document.querySelectorAll('#starship-sheet-section [data-ss]').forEach(e=>fields[e.id]=e.value);return {version:1,fields};};
  const fillSS=sheet=>{ssHydrate=true;Object.entries(sheet?.fields||{}).forEach(([id,v])=>{if($(id))$(id).value=v});ssHydrate=false;recalcSS();};
  window.loadSS=async function(){
    if(!currentChronicleUser)return;
    const {data,error}=await destinySupabase.from('starship_sheets').select('*').eq('lobby_key','destiny-main').maybeSingle();
    if(error){$('ss-status').textContent='STARSHIP LOAD ERROR // '+error.message;return;}
    ssRecord=data||null; fillSS(data?.sheet||{}); $('ss-status').textContent=data?'SHARED STARSHIP LOADED // AUTO-SAVE ACTIVE':'NEW SHARED STARSHIP // AUTO-SAVE ACTIVE';
  };
  window.saveSS=async function(manual=false){
    if(ssHydrate||!currentChronicleUser)return; clearTimeout(ssTimer);
    const payload={lobby_key:'destiny-main',ship_name:$('ss-name')?.value||'',sheet:collectSS(),updated_by:currentChronicleUser.id};
    if(!ssRecord)payload.created_by=currentChronicleUser.id;
    const {data,error}=await destinySupabase.from('starship_sheets').upsert(payload,{onConflict:'lobby_key'}).select().single();
    if(error){$('ss-status').textContent='STARSHIP SAVE FAILED // '+error.message;return;}
    ssRecord=data; $('ss-status').textContent=(manual?'SAVED // ':'AUTO-SAVED // ')+new Date().toLocaleTimeString()+' // SHARED WITH CREW';
  };
  window.rollSS=function(kind){
    const d=rollD20(); let bonus=0,label='';
    if(kind==='pilot'){bonus=ssN('ss-pilotmod')+ssN('ss-size')+csAbilityMod(ssN('ss-dex'));label='PILOT CHECK';}
    if(kind==='initiative'){bonus=ssN('ss-pilotmod')+ssN('ss-size')+csAbilityMod(ssN('ss-dex'));label='VEHICLE INITIATIVE';}
    if(kind==='attack'){bonus=ssN('ss-bab')+csAbilityMod(ssN('ss-int'));label='VEHICLE ATTACK';}
    openCharacterModal(label,`<div class="cs-roll-result">d20 ${d} ${signed(bonus)} = <b>${d+bonus}</b></div>`,'');
  };
  document.querySelectorAll('#starship-sheet-section [data-ss]').forEach(e=>{e.addEventListener('input',()=>{if(ssHydrate)return;recalcSS();clearTimeout(ssTimer);ssTimer=setTimeout(()=>saveSS(false),900);});e.addEventListener('change',()=>{if(ssHydrate)return;recalcSS();clearTimeout(ssTimer);ssTimer=setTimeout(()=>saveSS(false),900);});});
  recalcSS();

  // Wrap navigation instead of editing the original function internals.
  const baseShow=showChronicleSection;
  showChronicleSection=function(section){
    const ship=$('starship-sheet-section'),shipButton=$('nav-starship');
    if(section==='starship'){
      baseShow('npcs');
      $('npc-section').style.display='none'; $('nav-npcs').classList.remove('active');
      ship.style.display='block'; shipButton.classList.add('active');
      recalcSS(); loadSS(); scrollChronicleTop(); return;
    }
    if(ship)ship.style.display='none'; if(shipButton)shipButton.classList.remove('active');
    baseShow(section);
  };

  console.log('[DESTINY v1.5 PATCH] loaded');
})();