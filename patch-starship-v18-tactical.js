(()=>{
  const $=id=>document.getElementById(id);
  const n=id=>Number($(id)?.value||0)||0;
  const signed=v=>(v>=0?'+':'')+v;
  const rollDie=s=>Math.floor(Math.random()*s)+1;
  const ship=$('starship-sheet-section');
  const panel=$('ss-combat-console');
  if(!ship||!panel)return;

  const fieldLabel=id=>$(id)?.closest('.cs-field')?.querySelector('.cs-label');
  if(fieldLabel('ss-sr')) fieldLabel('ss-sr').textContent='EFFECTIVE SR';
  if(fieldLabel('ss-maxsr')) fieldLabel('ss-maxsr').textContent='BASE SHIELD RATING';
  if($('ss-sr')){$('ss-sr').readOnly=true;$('ss-sr').title='Derived from base SR, shield state, and current power routing.';}

  panel.innerHTML=`
    <div class="section-title">LIVE COMBAT CONSOLE // TACTICAL DOSSIER RULESET</div>
    <div class="cs-help">Power can be routed to one system by starving the other two. A raw hit meeting or exceeding Damage Threshold can destabilize active shields before shield protection is applied.</div>

    <div class="cs-grid" style="margin-top:10px">
      <div class="cs-field"><div class="cs-label">POWER MODE</div><select id="ss-power-mode" class="cs-select" data-ss>
        <option value="regulated">REGULATED</option>
        <option value="engines">ENGINES</option>
        <option value="capacitors">CAPACITORS / WEAPONS</option>
        <option value="shields">SHIELDS</option>
      </select></div>
      <div class="cs-field"><div class="cs-label">SHIELDS</div><select id="ss-shields-online" class="cs-select" data-ss>
        <option value="1">ONLINE</option><option value="0">FAILED / OFFLINE</option>
      </select></div>
      <div class="cs-field"><div class="cs-label">SHIELD STRAIN</div><input id="ss-shield-strain" type="number" min="0" value="0" class="cs-input" data-ss></div>
      <div class="cs-field"><div class="cs-label">NEXT STABILITY DC</div><div id="ss-shield-dc" class="cs-score">10</div></div>
      <div class="cs-field"><div class="cs-label">STABILITY SKILL</div><select id="ss-shield-skill" class="cs-select" data-ss><option value="computer">USE COMPUTER</option><option value="mechanics">MECHANICS</option></select></div>
      <div class="cs-field"><div class="cs-label">CONDITION STEP</div><select id="ss-condition" class="cs-select" data-ss>
        <option value="0">NORMAL (+0)</option><option value="1">-1</option><option value="2">-2</option><option value="3">-5</option><option value="4">-10</option><option value="5">DISABLED</option>
      </select></div>
      <div class="cs-field"><div class="cs-label">CURRENT PENALTY</div><div id="ss-condition-penalty" class="cs-score">+0</div></div>
      <div class="cs-field"><div class="cs-label">INCOMING DAMAGE</div><input id="ss-incoming-damage" type="number" min="0" value="0" class="cs-input"></div>
    </div>

    <div id="ss-power-readout" style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0"></div>

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
      <button class="cs-roll-button" onclick="setSSPower('regulated')">REGULATE SYSTEMS</button>
      <button class="cs-roll-button" onclick="setSSPower('engines')">POWER ENGINES</button>
      <button class="cs-roll-button" onclick="setSSPower('capacitors')">POWER CAPACITORS</button>
      <button class="cs-roll-button" onclick="setSSPower('shields')">POWER SHIELDS</button>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
      <button class="cs-roll-button" onclick="applySSDamage()">RESOLVE INCOMING HIT</button>
      <button class="cs-roll-button" onclick="restoreSSShields()">RESTORE SHIELDS AFTER REPAIR</button>
      <button class="cs-roll-button" onclick="failSSShields()">FAIL SHIELDS</button>
      <button class="cs-roll-button" onclick="resetSSCombat()">RESET COMBAT STATE</button>
    </div>
    <div id="ss-damage-result" class="cs-help" style="margin-top:10px">NO DAMAGE RESOLVED</div>
  `;

  const conditionPenalty=step=>[0,-1,-2,-5,-10,-10][Math.max(0,Math.min(5,Number(step)||0))];
  const powerMode=()=>['regulated','engines','capacitors','shields'].includes($('ss-power-mode')?.value)?$('ss-power-mode').value:'regulated';
  const shieldsOnline=()=>String($('ss-shields-online')?.value||'1')==='1';
  const baseSR=()=>Math.max(0,n('ss-maxsr'));
  const effectiveSR=()=>{
    if(!shieldsOnline())return 0;
    const base=baseSR(),mode=powerMode();
    if(mode==='shields')return base*2;
    if(mode==='engines'||mode==='capacitors')return Math.floor(base/2);
    return base;
  };
  const speedMult=()=>powerMode()==='engines'?2:(powerMode()==='capacitors'||powerMode()==='shields'?0.5:1);
  const weaponMult=()=>powerMode()==='capacitors'?2:(powerMode()==='engines'||powerMode()==='shields'?0.5:1);

  function badge(text){const s=document.createElement('span');s.className='cs-mini';s.style='border:1px solid #3ab7c8;padding:6px 8px;border-radius:4px';s.textContent=text;return s;}
  function syncUI(){
    if($('ss-sr'))$('ss-sr').value=String(effectiveSR());
    if($('ss-shield-dc'))$('ss-shield-dc').textContent=shieldsOnline()?String(10+Math.max(0,n('ss-shield-strain'))*5):'OFFLINE';
    if($('ss-condition-penalty'))$('ss-condition-penalty').textContent=n('ss-condition')>=5?'DISABLED':signed(conditionPenalty(n('ss-condition')));
    const r=$('ss-power-readout'); if(r){r.innerHTML='';[
      `SR ${effectiveSR()} [BASE ${baseSR()}]`,
      shieldsOnline()?'SHIELDS ONLINE':'SHIELDS FAILED',
      `STRAIN ${Math.max(0,n('ss-shield-strain'))}`,
      shieldsOnline()?`NEXT CHECK DC ${10+Math.max(0,n('ss-shield-strain'))*5}`:'CHECK OFFLINE',
      `SPEED ×${speedMult()}`,
      `WEAPON DAMAGE ×${weaponMult()}`
    ].forEach(x=>r.appendChild(badge(x)));}
  }
  function persist(){syncUI(); if(typeof saveSS==='function')saveSS(false);}

  ['ss-power-mode','ss-shields-online','ss-shield-strain','ss-condition'].forEach(id=>$(id)?.addEventListener('change',persist));
  $('ss-maxsr')?.addEventListener('input',syncUI);

  window.setSSPower=function(mode){if($('ss-power-mode'))$('ss-power-mode').value=mode;persist();};
  window.failSSShields=function(){if($('ss-shields-online'))$('ss-shields-online').value='0';persist();};
  window.restoreSSShields=function(){if($('ss-shields-online'))$('ss-shields-online').value=baseSR()>0?'1':'0';if($('ss-shield-strain'))$('ss-shield-strain').value='0';persist();};

  function applyHullDamage(raw,srUsed,shieldFailed){
    const dt=Math.max(0,n('ss-dt'));
    const dr=Math.max(0,n('ss-dr'));
    let hp=Math.max(0,n('ss-hp'));
    const afterShield=shieldFailed?raw:Math.max(0,raw-srUsed);
    const effective=Math.max(0,afterShield-dr);
    hp=Math.max(0,hp-effective); $('ss-hp').value=String(hp);
    let step=n('ss-condition'),threshold=false;
    if(dt>0&&effective>=dt){step=Math.min(5,step+1);threshold=true;if($('ss-condition'))$('ss-condition').value=String(step);}
    if(hp<=0&&$('ss-condition'))$('ss-condition').value='5';
    syncUI();
    return {effective,hp,threshold,dr};
  }

  window.applySSDamage=function(){
    const raw=Math.max(0,n('ss-incoming-damage')); if(!raw)return;
    const dt=Math.max(0,n('ss-dt')),sr=effectiveSR();
    const needsCheck=shieldsOnline()&&sr>0&&dt>0&&raw>=dt;
    let shieldFailed=false,checkText='';
    if(needsCheck){
      const strain=Math.max(0,n('ss-shield-strain')),dc=10+strain*5;
      const useComputer=$('ss-shield-skill')?.value!=='mechanics';
      const mod=useComputer?n('ss-usecomputer'):n('ss-mechanics');
      const d=rollDie(20),total=d+mod,pass=total>=dc;
      checkText=` // ${useComputer?'USE COMPUTER':'MECHANICS'} ${d} ${signed(mod)} = ${total} vs DC ${dc}: ${pass?'SHIELDS HOLD':'SHIELDS FAIL'}`;
      if(pass){$('ss-shield-strain').value=String(strain+1);}else{shieldFailed=true;$('ss-shields-online').value='0';}
    }
    const result=applyHullDamage(raw,sr,shieldFailed);
    const shieldText=shieldFailed?'SR 0 (FAILED BEFORE PROTECTION)':`SR ${sr}`;
    $('ss-damage-result').textContent=`RAW ${raw} // ${shieldText} // DR ${result.dr} // HULL DAMAGE ${result.effective} // HP ${result.hp}${result.threshold?' // POST-SHIELD DAMAGE MEETS DT: -1 CONDITION STEP':''}${checkText}`;
    saveSS(false);
  };

  window.resetSSCombat=function(){
    $('ss-hp').value=$('ss-maxhp').value||'0';
    if($('ss-shields-online'))$('ss-shields-online').value=baseSR()>0?'1':'0';
    if($('ss-shield-strain'))$('ss-shield-strain').value='0';
    if($('ss-power-mode'))$('ss-power-mode').value='regulated';
    if($('ss-condition'))$('ss-condition').value='0';
    if($('ss-incoming-damage'))$('ss-incoming-damage').value='0';
    if($('ss-damage-result'))$('ss-damage-result').textContent='COMBAT STATE RESET';
    persist();
  };

  function parseDamage(expr){
    const m=String(expr||'').trim().toLowerCase().match(/^(\d+)d(\d+)(?:x(\d+))?(?:\s*([+-])\s*(\d+))?$/); if(!m)return null;
    const count=Number(m[1]),sides=Number(m[2]),nativeMult=Number(m[3]||1),flat=m[4]?(m[4]==='-'?-1:1)*Number(m[5]):0;
    if(count<1||count>100||sides<2||sides>1000)return null;
    const rolls=[];let dice=0;for(let i=0;i<count;i++){const r=rollDie(sides);rolls.push(r);dice+=r;}
    const nativeTotal=dice*nativeMult+flat; return {rolls,dice,nativeMult,flat,nativeTotal};
  }
  window.rollSSDamage=function(which){
    const expr=$(which===1?'ss-w1-damage':'ss-w2-damage')?.value||'';
    const name=$(which===1?'ss-w1-name':'ss-w2-name')?.value||`WEAPON ${which}`;
    const r=parseDamage(expr); if(!r){openCharacterModal(name+' DAMAGE','<div class="cs-rule-reference-text">Could not parse damage.</div>','');return;}
    const pm=weaponMult(),final=Math.floor(r.nativeTotal*pm);
    const detail=`${r.rolls.join(' + ')}${r.nativeMult!==1?' × '+r.nativeMult:''}${r.flat?' '+signed(r.flat):''} = ${r.nativeTotal}${pm!==1?' // POWER ×'+pm+' = <b>'+final+'</b>':' = <b>'+final+'</b>'}`;
    openCharacterModal(name+' DAMAGE',`<div class="cs-roll-result">${detail}</div>`,'');
  };

  const priorLoad=window.loadSS;
  if(typeof priorLoad==='function')window.loadSS=async function(){await priorLoad();syncUI();};
  syncUI();
  console.log('[DESTINY STARSHIP v1.8] Tactical Dossier power/shield rules loaded');
})();