(()=>{
  const $=id=>document.getElementById(id);
  const signed=n=>(Number(n)>=0?'+':'')+Number(n||0);

  const old=$('starship-sheet-section');
  if(!old || !$('character-sheet-section')) return;

  const replacement=document.createElement('div');
  replacement.id='starship-sheet-section';
  replacement.className='character-sheet-section';
  replacement.style.display='none';
  replacement.innerHTML=`<div class="cs-shell">
    <div class="cs-panel">
      <div class="cs-title">SHARED STARSHIP CHARACTER SHEET</div>
      <div class="cs-subtitle">SAGA EDITION // PUBLISHED STAT BLOCK VALUES ARE AUTHORITATIVE // SHARED BY THE CREW</div>
      <div class="cs-grid" style="margin-top:10px">
        <div class="cs-field"><div class="cs-label">SHIP NAME</div><input id="ss-name" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">MODEL / TYPE</div><input id="ss-model" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">CHALLENGE LEVEL</div><input id="ss-cl" type="number" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">SIZE / VEHICLE CLASS</div><input id="ss-size-class" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">CAPTAIN</div><input id="ss-captain" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">INITIATIVE MODIFIER</div><input id="ss-init" type="number" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">PERCEPTION MODIFIER</div><input id="ss-perception" type="number" class="cs-input" data-ss></div>
      </div>
    </div>

    <div class="cs-panel">
      <div class="section-title">DEFENSES / DURABILITY</div>
      <div class="cs-grid">
        <div class="cs-field"><div class="cs-label">REFLEX DEFENSE</div><input id="ss-reflex" type="number" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">FLAT-FOOTED REFLEX</div><input id="ss-flatref" type="number" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">FORTITUDE DEFENSE</div><input id="ss-fort" type="number" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">ARMOR BONUS</div><input id="ss-armor" type="number" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">DAMAGE THRESHOLD</div><input id="ss-dt" type="number" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">DAMAGE REDUCTION</div><input id="ss-dr" type="number" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">CURRENT HP</div><input id="ss-hp" type="number" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">MAX HP</div><input id="ss-maxhp" type="number" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">CURRENT SR</div><input id="ss-sr" type="number" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">MAX SR</div><input id="ss-maxsr" type="number" class="cs-input" data-ss></div>
      </div>
      <div class="cs-help">Vehicles and starships use Reflex and Fortitude Defense. There is no vehicle Will Defense on this sheet.</div>
    </div>

    <div class="cs-two-column">
      <div class="cs-panel">
        <div class="section-title">MOVEMENT / TRAVEL</div>
        <div class="cs-grid">
          <div class="cs-field wide"><div class="cs-label">STARSHIP SPEED</div><input id="ss-speed" class="cs-input" data-ss></div>
          <div class="cs-field wide"><div class="cs-label">MAXIMUM VELOCITY</div><input id="ss-maxvelocity" class="cs-input" data-ss></div>
          <div class="cs-field"><div class="cs-label">HYPERDRIVE</div><input id="ss-hyperdrive" class="cs-input" data-ss></div>
          <div class="cs-field"><div class="cs-label">BACKUP HYPERDRIVE</div><input id="ss-backup" class="cs-input" data-ss></div>
        </div>
      </div>
      <div class="cs-panel">
        <div class="section-title">CAPACITY</div>
        <div class="cs-grid">
          <div class="cs-field"><div class="cs-label">CREW</div><input id="ss-crew" class="cs-input" data-ss></div>
          <div class="cs-field"><div class="cs-label">PASSENGERS</div><input id="ss-passengers" class="cs-input" data-ss></div>
          <div class="cs-field"><div class="cs-label">CARGO</div><input id="ss-cargo" class="cs-input" data-ss></div>
          <div class="cs-field"><div class="cs-label">CONSUMABLES</div><input id="ss-consumables" class="cs-input" data-ss></div>
        </div>
      </div>
    </div>

    <div class="cs-panel">
      <div class="section-title">CREW STATIONS / SKILL CHECKS</div>
      <div class="cs-grid">
        <div class="cs-field"><div class="cs-label">PILOT</div><input id="ss-pilot" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">PILOT CHECK TOTAL MOD</div><input id="ss-pilotmod" type="number" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">SYSTEMS OPERATOR</div><input id="ss-systems" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">USE COMPUTER TOTAL MOD</div><input id="ss-usecomputer" type="number" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">ENGINEER</div><input id="ss-engineer" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">MECHANICS TOTAL MOD</div><input id="ss-mechanics" type="number" class="cs-input" data-ss></div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        <button class="cs-roll-button" onclick="rollSS('initiative')">ROLL INITIATIVE</button>
        <button class="cs-roll-button" onclick="rollSS('perception')">ROLL PERCEPTION</button>
        <button class="cs-roll-button" onclick="rollSS('pilot')">ROLL PILOT</button>
        <button class="cs-roll-button" onclick="rollSS('computer')">ROLL USE COMPUTER</button>
        <button class="cs-roll-button" onclick="rollSS('mechanics')">ROLL MECHANICS</button>
      </div>
    </div>

    <div class="cs-panel">
      <div class="section-title">WEAPONS</div>
      <div class="cs-grid">
        <div class="cs-field wide"><div class="cs-label">WEAPON 1</div><input id="ss-w1-name" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">ATTACK MOD</div><input id="ss-w1-attack" type="number" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">DAMAGE</div><input id="ss-w1-damage" class="cs-input" data-ss></div>
        <div class="cs-field wide"><div class="cs-label">WEAPON 2</div><input id="ss-w2-name" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">ATTACK MOD</div><input id="ss-w2-attack" type="number" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">DAMAGE</div><input id="ss-w2-damage" class="cs-input" data-ss></div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        <button class="cs-roll-button" onclick="rollSS('weapon1')">ROLL WEAPON 1 ATTACK</button>
        <button class="cs-roll-button" onclick="rollSS('weapon2')">ROLL WEAPON 2 ATTACK</button>
      </div>
      <div class="cs-help">Weapon attack bonuses are entered from the published stat block instead of reverse-engineering a missing vehicle Intelligence score.</div>
    </div>

    <div class="cs-two-column">
      <div class="cs-panel">
        <div class="section-title">SPECIAL SYSTEMS</div>
        <textarea id="ss-special" class="cs-textarea" data-ss></textarea>
      </div>
      <div class="cs-panel">
        <div class="section-title">SUGGESTED STATIONS / CREW NOTES</div>
        <textarea id="ss-stations" class="cs-textarea" data-ss></textarea>
      </div>
    </div>

    <details class="cs-panel">
      <summary class="section-title" style="cursor:pointer">ADVANCED / OPTIONAL VEHICLE ABILITY SCORES</summary>
      <div class="cs-help" style="margin:8px 0">Use these only when the source stat block actually provides STR, DEX, or INT. They do not overwrite the published defenses or weapon bonuses above.</div>
      <div class="cs-grid">
        <div class="cs-field"><div class="cs-label">STR</div><input id="ss-str" type="number" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">DEX</div><input id="ss-dex" type="number" class="cs-input" data-ss></div>
        <div class="cs-field"><div class="cs-label">INT</div><input id="ss-int" type="number" class="cs-input" data-ss></div>
      </div>
    </details>

    <div class="cs-panel">
      <div id="ss-status" class="cs-save-status">SHARED STARSHIP // WAITING FOR LOGIN</div>
      <button class="cs-roll-button" onclick="saveSS(true)">SAVE SHARED STARSHIP</button>
    </div>
  </div>`;
  old.replaceWith(replacement);

  let ssRecord=null,ssTimer=null,ssHydrate=false;
  const defaults={
    'ss-name':"Fortune's Favor",'ss-model':'Dynamic-class light freighter','ss-cl':'6','ss-size-class':'Colossal space transport','ss-captain':'',
    'ss-init':'4','ss-perception':'8','ss-reflex':'15','ss-flatref':'12','ss-fort':'24','ss-armor':'8','ss-dt':'34','ss-dr':'0',
    'ss-hp':'120','ss-maxhp':'120','ss-sr':'25','ss-maxsr':'25','ss-speed':'Fly 12 squares (starship scale)','ss-maxvelocity':'800 km/h',
    'ss-hyperdrive':'x2','ss-backup':'x12','ss-crew':'4-6','ss-passengers':'6','ss-cargo':'60 tons','ss-consumables':'',
    'ss-pilot':'','ss-pilotmod':'0','ss-systems':'','ss-usecomputer':'0','ss-engineer':'','ss-mechanics':'0',
    'ss-w1-name':'Dorsal laser cannon','ss-w1-attack':'6','ss-w1-damage':'4d10x2','ss-w2-name':'Ventral laser cannon','ss-w2-attack':'6','ss-w2-damage':'4d10x2',
    'ss-special':'Combat Thrusters; Navicomputer',
    'ss-stations':"Pilot: Pilot checks and movement.\nGunner(s): laser cannons.\nSystems operator: Mechanics/Use Computer for shields, sensors, and repairs.",
    'ss-str':'','ss-dex':'','ss-int':''
  };

  function seed(){Object.entries(defaults).forEach(([id,v])=>{const e=$(id);if(e)e.value=v;});}
  function collect(){const fields={};document.querySelectorAll('#starship-sheet-section [data-ss]').forEach(e=>fields[e.id]=e.value);return {version:2,fields};}
  function fill(sheet){ssHydrate=true;seed();Object.entries(sheet?.fields||{}).forEach(([id,v])=>{const e=$(id);if(e)e.value=v;});ssHydrate=false;}
  function queueSave(){if(ssHydrate)return;clearTimeout(ssTimer);ssTimer=setTimeout(()=>saveSS(false),900);}
  document.querySelectorAll('#starship-sheet-section [data-ss]').forEach(e=>{e.addEventListener('input',queueSave);e.addEventListener('change',queueSave);});

  window.recalcSS=function(){};
  window.loadSS=async function(){
    if(!currentChronicleUser)return;
    const {data,error}=await destinySupabase.from('starship_sheets').select('*').eq('lobby_key','destiny-main').maybeSingle();
    if(error){$('ss-status').textContent='STARSHIP LOAD ERROR // '+error.message;return;}
    ssRecord=data||null; fill(data?.sheet||{});
    $('ss-status').textContent=data?'SHARED STARSHIP LOADED // AUTO-SAVE ACTIVE':'FORTUNE\'S FAVOR TEMPLATE LOADED // SAVE TO CREATE SHARED RECORD';
  };
  window.saveSS=async function(manual=false){
    if(ssHydrate||!currentChronicleUser)return;clearTimeout(ssTimer);
    $('ss-status').textContent='SAVING SHARED STARSHIP...';
    const payload={lobby_key:'destiny-main',ship_name:$('ss-name')?.value||'',sheet:collect(),updated_by:currentChronicleUser.id};
    if(!ssRecord)payload.created_by=currentChronicleUser.id;
    const {data,error}=await destinySupabase.from('starship_sheets').upsert(payload,{onConflict:'lobby_key'}).select().single();
    if(error){$('ss-status').textContent='STARSHIP SAVE FAILED // '+error.message;return;}
    ssRecord=data; $('ss-status').textContent=(manual?'SAVED // ':'AUTO-SAVED // ')+new Date().toLocaleTimeString()+' // SHARED WITH CREW';
  };
  window.rollSS=function(kind){
    const d=rollD20();let bonus=0,label='';
    const n=id=>Number($(id)?.value||0)||0;
    if(kind==='initiative'){bonus=n('ss-init');label='VEHICLE INITIATIVE';}
    if(kind==='perception'){bonus=n('ss-perception');label='VEHICLE PERCEPTION';}
    if(kind==='pilot'){bonus=n('ss-pilotmod');label='PILOT CHECK';}
    if(kind==='computer'){bonus=n('ss-usecomputer');label='USE COMPUTER';}
    if(kind==='mechanics'){bonus=n('ss-mechanics');label='MECHANICS';}
    if(kind==='weapon1'){bonus=n('ss-w1-attack');label=$('ss-w1-name')?.value||'WEAPON 1 ATTACK';}
    if(kind==='weapon2'){bonus=n('ss-w2-attack');label=$('ss-w2-name')?.value||'WEAPON 2 ATTACK';}
    openCharacterModal(label,`<div class="cs-roll-result">d20 ${d} ${signed(bonus)} = <b>${d+bonus}</b></div>`,'');
  };

  seed();
  console.log('[DESTINY STARSHIP v1.6] published-stat-block redesign loaded');
})();