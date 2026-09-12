(()=>{
  const $=id=>document.getElementById(id);
  const n=id=>Number($(id)?.value||0)||0;
  const signed=v=>(v>=0?'+':'')+v;
  const d20=()=>Math.floor(Math.random()*20)+1;
  const d8=()=>Math.floor(Math.random()*8)+1;
  const ship=$('starship-sheet-section');
  const combat=$('ss-combat-console');
  if(!ship||!combat)return;

  const panel=document.createElement('div');
  panel.className='cs-panel';
  panel.id='ss-crew-console';
  panel.innerHTML=`
    <div class="section-title">CREW STATIONS // COMBAT ACTIONS</div>
    <div class="cs-help">Station assignments and temporary support bonuses are shared with the crew. This layer leaves the proven v1.8 power-routing and shield-strain engine untouched.</div>

    <div class="cs-grid" style="margin-top:10px">
      <div class="cs-field"><div class="cs-label">PILOT</div><input id="ss-crew-pilot" class="cs-input" data-ss></div>
      <div class="cs-field"><div class="cs-label">SYSTEMS OPERATOR</div><input id="ss-crew-systems" class="cs-input" data-ss></div>
      <div class="cs-field"><div class="cs-label">ENGINEER</div><input id="ss-crew-engineer" class="cs-input" data-ss></div>
      <div class="cs-field"><div class="cs-label">DORSAL GUNNER</div><input id="ss-crew-gunner1" class="cs-input" data-ss></div>
      <div class="cs-field"><div class="cs-label">VENTRAL GUNNER</div><input id="ss-crew-gunner2" class="cs-input" data-ss></div>
      <div class="cs-field"><div class="cs-label">NEXT PILOT SUPPORT</div><input id="ss-pilot-support" type="number" value="0" class="cs-input" data-ss readonly></div>
      <div class="cs-field"><div class="cs-label">NEXT GUNNER SUPPORT</div><input id="ss-gunner-support" type="number" value="0" class="cs-input" data-ss readonly></div>
    </div>

    <div style="margin-top:14px" class="cs-label">PILOT STATION</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
      <button class="cs-roll-button" onclick="ssCrewPilotCheck()">ROLL PILOT CHECK</button>
      <button class="cs-roll-button" onclick="ssCrewEscapeCheck()">ESCAPE / NAV PILOT // DC 15</button>
    </div>

    <div style="margin-top:14px" class="cs-label">SYSTEMS OPERATOR</div>
    <div class="cs-help">The Nar Shaddaa training encounter established DC 15 Use Computer support: +2 to the next Pilot check for navigation, or +2 to one gunner attack from improved sensors.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
      <button class="cs-roll-button" onclick="ssAssistNavigation()">ASSIST NAVIGATION // DC 15</button>
      <button class="cs-roll-button" onclick="ssSensorLock()">IMPROVE SENSORS // DC 15</button>
    </div>

    <div style="margin-top:14px" class="cs-label">GUNNER STATIONS</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
      <button class="cs-roll-button" onclick="ssFireWeapon(1)">FIRE DORSAL CANNON</button>
      <button class="cs-roll-button" onclick="ssFireWeapon(2)">FIRE VENTRAL CANNON</button>
    </div>

    <div style="margin-top:14px" class="cs-label">ENGINEER STATION</div>
    <div class="cs-help">Long repair uses the existing Mechanics modifier. Shield restoration remains tied to the separate v1.8 repair/restore control so shield strain is not bypassed accidentally.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
      <button class="cs-roll-button" onclick="ssLongRepair()">1-HOUR HULL REPAIR // DC 20</button>
      <button class="cs-roll-button" onclick="restoreSSShields()">RESTORE SHIELDS AFTER REPAIR</button>
    </div>

    <div id="ss-crew-result" class="cs-help" style="margin-top:12px">NO CREW ACTION RESOLVED</div>
  `;
  combat.parentNode.insertBefore(panel,combat);

  function conditionPenalty(){
    return [0,-1,-2,-5,-10,-10][Math.max(0,Math.min(5,n('ss-condition')))];
  }
  function setResult(text){if($('ss-crew-result'))$('ss-crew-result').textContent=text;}
  function save(){if(typeof saveSS==='function')saveSS(false);}
  function roll(label,mod,dc=null){
    const die=d20(),total=die+mod;
    const result={die,total,mod,success:dc===null?null:total>=dc};
    setResult(`${label} // d20 ${die} ${signed(mod)} = ${total}${dc===null?'':` vs DC ${dc} // ${result.success?'SUCCESS':'FAILURE'}`}`);
    return result;
  }

  window.ssCrewPilotCheck=function(){
    const support=n('ss-pilot-support');
    const mod=n('ss-pilotmod')+conditionPenalty()+support;
    const r=roll('PILOT CHECK',mod);
    if(support){$('ss-pilot-support').value='0';save();}
    return r;
  };

  window.ssCrewEscapeCheck=function(){
    const support=n('ss-pilot-support');
    const mod=n('ss-pilotmod')+conditionPenalty()+support;
    const r=roll('ESCAPE / NAV PILOT',mod,15);
    if(support){$('ss-pilot-support').value='0';save();}
    if(r.success)setResult($('ss-crew-result').textContent+' // QUALIFIES FOR ESCAPE PROGRESS WHEN ENCOUNTER MOVEMENT REQUIREMENTS ARE MET');
  };

  function systemsCheck(label,onSuccess){
    const mod=n('ss-usecomputer')+conditionPenalty();
    const r=roll(label,mod,15);
    if(r.success)onSuccess();
    save();
    return r;
  }

  window.ssAssistNavigation=function(){
    systemsCheck('ASSIST NAVIGATION',()=>{
      $('ss-pilot-support').value='2';
      setTimeout(()=>setResult($('ss-crew-result').textContent+' // +2 STORED FOR NEXT PILOT CHECK'),0);
    });
  };

  window.ssSensorLock=function(){
    systemsCheck('IMPROVE SENSORS',()=>{
      $('ss-gunner-support').value='2';
      setTimeout(()=>setResult($('ss-crew-result').textContent+' // +2 STORED FOR NEXT GUNNER ATTACK'),0);
    });
  };

  function weaponPowerMultiplier(){
    const mode=$('ss-power-mode')?.value||'regulated';
    return mode==='capacitors'?2:(mode==='engines'||mode==='shields'?0.5:1);
  }
  function parseDamage(expr){
    const m=String(expr||'').trim().toLowerCase().match(/^(\d+)d(\d+)(?:x(\d+))?(?:\s*([+-])\s*(\d+))?$/); if(!m)return null;
    const count=Number(m[1]),sides=Number(m[2]),mult=Number(m[3]||1),flat=m[4]?(m[4]==='-'?-1:1)*Number(m[5]):0;
    if(count<1||count>100||sides<2||sides>1000)return null;
    let dice=0;const rolls=[];for(let i=0;i<count;i++){const r=Math.floor(Math.random()*sides)+1;rolls.push(r);dice+=r;}
    const native=dice*mult+flat;return{rolls,mult,flat,native};
  }

  window.ssFireWeapon=function(which){
    const attackBase=n(which===1?'ss-w1-attack':'ss-w2-attack');
    const name=$(which===1?'ss-w1-name':'ss-w2-name')?.value||`WEAPON ${which}`;
    const damageExpr=$(which===1?'ss-w1-damage':'ss-w2-damage')?.value||'';
    const support=n('ss-gunner-support');
    const attackMod=attackBase+conditionPenalty()+support;
    const attack=roll(`${name.toUpperCase()} ATTACK`,attackMod);
    const dmg=parseDamage(damageExpr);
    let text=$('ss-crew-result').textContent;
    if(dmg){
      const p=weaponPowerMultiplier();
      const final=Math.floor(dmg.native*p);
      text+=` // DAMAGE ${dmg.rolls.join('+')}${dmg.mult!==1?' × '+dmg.mult:''}${dmg.flat?' '+signed(dmg.flat):''} = ${dmg.native}${p!==1?' // POWER ×'+p:''} // TOTAL ${final}`;
    }else text+=' // DAMAGE FORMAT COULD NOT BE PARSED';
    if(support)text+=' // SENSOR +2 CONSUMED';
    setResult(text);
    if(support)$('ss-gunner-support').value='0';
    save();
    return attack;
  };

  window.ssLongRepair=function(){
    const mod=n('ss-mechanics')+conditionPenalty();
    const r=roll('1-HOUR HULL REPAIR',mod,20);
    if(r.success){
      const healed=d8(),max=Math.max(0,n('ss-maxhp')),before=Math.max(0,n('ss-hp'));
      const after=Math.min(max,before+healed);$('ss-hp').value=String(after);
      setResult($('ss-crew-result').textContent+` // REPAIRED ${after-before} HP (${before} → ${after})`);
    }
    save();
  };

  // Populate new assignment fields from the already-existing station names where useful.
  if(!$('ss-crew-pilot').value&&$('ss-pilot')?.value)$('ss-crew-pilot').value=$('ss-pilot').value;
  if(!$('ss-crew-systems').value&&$('ss-systems')?.value)$('ss-crew-systems').value=$('ss-systems').value;
  if(!$('ss-crew-engineer').value&&$('ss-engineer')?.value)$('ss-crew-engineer').value=$('ss-engineer').value;

  console.log('[DESTINY STARSHIP v1.9] crew stations and modular actions loaded');
})();