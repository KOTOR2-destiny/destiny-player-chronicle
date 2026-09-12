(()=>{
  const $=id=>document.getElementById(id);
  const n=id=>Number($(id)?.value||0)||0;
  const signed=v=>(v>=0?'+':'')+v;
  const rollDie=sides=>Math.floor(Math.random()*sides)+1;

  const ship=$('starship-sheet-section');
  if(!ship)return;
  const savePanel=$('ss-status')?.closest('.cs-panel');
  if(!savePanel)return;

  const panel=document.createElement('div');
  panel.className='cs-panel';
  panel.id='ss-combat-console';
  panel.innerHTML=`
    <div class="section-title">LIVE COMBAT CONSOLE</div>
    <div class="cs-help">Uses Saga Edition shield, damage threshold, condition track, and Mechanics rules. Changes here update the shared ship record.</div>
    <div class="cs-grid" style="margin-top:10px">
      <div class="cs-field"><div class="cs-label">CONDITION STEP</div><select id="ss-condition" class="cs-select" data-ss>
        <option value="0">NORMAL (+0)</option><option value="1">-1</option><option value="2">-2</option><option value="3">-5</option><option value="4">-10</option><option value="5">DISABLED</option>
      </select></div>
      <div class="cs-field"><div class="cs-label">CURRENT PENALTY</div><div id="ss-condition-penalty" class="cs-score">+0</div></div>
      <div class="cs-field"><div class="cs-label">INCOMING DAMAGE</div><input id="ss-incoming-damage" type="number" min="0" value="0" class="cs-input"></div>
      <div class="cs-field"><div class="cs-label">LAST RESULT</div><div id="ss-damage-result" class="cs-mini">NO DAMAGE APPLIED</div></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
      <button class="cs-roll-button" onclick="applySSDamage()">APPLY DAMAGE</button>
      <button class="cs-roll-button" onclick="rechargeSSShields()">RECHARGE SHIELDS // DC 20</button>
      <button class="cs-roll-button" onclick="regulateSSPower()">REGULATE POWER // DC 20</button>
      <button class="cs-roll-button" onclick="repairSSObject()">1-HOUR REPAIR // DC 20</button>
      <button class="cs-roll-button" onclick="resetSSCombat()">RESET COMBAT STATE</button>
    </div>
  `;
  savePanel.parentNode.insertBefore(panel,savePanel);

  // Add damage roll controls under the existing weapon section.
  const weaponHelp=[...ship.querySelectorAll('.cs-help')].find(e=>e.textContent.includes('Weapon attack bonuses'));
  if(weaponHelp){
    const row=document.createElement('div');
    row.style='display:flex;gap:8px;flex-wrap:wrap;margin-top:8px';
    row.innerHTML='<button class="cs-roll-button" onclick="rollSSDamage(1)">ROLL WEAPON 1 DAMAGE</button><button class="cs-roll-button" onclick="rollSSDamage(2)">ROLL WEAPON 2 DAMAGE</button>';
    weaponHelp.insertAdjacentElement('afterend',row);
  }

  const conditionPenalty=step=>[0,-1,-2,-5,-10,-10][Math.max(0,Math.min(5,Number(step)||0))];
  const updateConditionUI=()=>{
    const step=n('ss-condition');
    const out=$('ss-condition-penalty');
    if(out)out.textContent=step>=5?'DISABLED':signed(conditionPenalty(step));
  };

  function queueSharedSave(){
    updateConditionUI();
    if(typeof saveSS==='function')saveSS(false);
  }
  $('ss-condition')?.addEventListener('change',queueSharedSave);
  updateConditionUI();

  window.applySSDamage=function(){
    const raw=Math.max(0,n('ss-incoming-damage'));
    if(!raw)return;
    const srBefore=Math.max(0,n('ss-sr'));
    const dr=Math.max(0,n('ss-dr'));
    const dt=Math.max(0,n('ss-dt'));
    let hp=Math.max(0,n('ss-hp'));
    let srAfter=srBefore;

    // Saga: SR reduces incoming attack damage. If attack damage exceeds current SR, SR drops by 5.
    const afterShield=Math.max(0,raw-srBefore);
    if(srBefore>0 && raw>srBefore)srAfter=Math.max(0,srBefore-5);
    const effective=Math.max(0,afterShield-dr);
    hp=Math.max(0,hp-effective);
    $('ss-sr').value=srAfter;
    $('ss-hp').value=hp;

    let step=n('ss-condition');
    let thresholdHit=false;
    if(effective>0 && dt>0 && effective>=dt){step=Math.min(5,step+1);thresholdHit=true;$('ss-condition').value=String(step);}
    if(hp<=0 && step<5){step=5;$('ss-condition').value='5';}
    updateConditionUI();

    const parts=[`RAW ${raw}`,`SR ${srBefore} → ${srAfter}`,`DR ${dr}`,`HP DAMAGE ${effective}`,`HP ${hp}`];
    if(thresholdHit)parts.push('DT EXCEEDED: -1 CONDITION STEP');
    if(hp<=0)parts.push('VEHICLE DISABLED AT 0 HP');
    $('ss-damage-result').textContent=parts.join(' // ');
    saveSS(false);
  };

  function mechanicsCheck(label,onSuccess){
    const mod=n('ss-mechanics')+conditionPenalty(n('ss-condition'));
    const d=rollDie(20),total=d+mod;
    if(total>=20)onSuccess();
    openCharacterModal(label,`<div class="cs-roll-result">d20 ${d} ${signed(mod)} = <b>${total}</b> vs DC 20<br>${total>=20?'SUCCESS':'FAILURE'}</div>`,'');
    saveSS(false);
  }

  window.rechargeSSShields=function(){
    mechanicsCheck('RECHARGE SHIELDS',()=>{
      const max=Math.max(0,n('ss-maxsr')); $('ss-sr').value=Math.min(max,n('ss-sr')+5);
    });
  };
  window.regulateSSPower=function(){
    mechanicsCheck('REGULATE POWER',()=>{
      $('ss-condition').value=String(Math.max(0,n('ss-condition')-1)); updateConditionUI();
    });
  };
  window.repairSSObject=function(){
    mechanicsCheck('1-HOUR VEHICLE REPAIR',()=>{
      const healed=rollDie(8),max=Math.max(0,n('ss-maxhp')); $('ss-hp').value=Math.min(max,n('ss-hp')+healed);
      const body=$('cs-modal-body'); if(body) setTimeout(()=>{body.innerHTML+=`<div class="cs-help">REPAIRED ${healed} HP.</div>`;},0);
    });
  };
  window.resetSSCombat=function(){
    $('ss-hp').value=$('ss-maxhp').value||'0'; $('ss-sr').value=$('ss-maxsr').value||'0'; $('ss-condition').value='0'; $('ss-incoming-damage').value='0';
    $('ss-damage-result').textContent='COMBAT STATE RESET'; updateConditionUI(); saveSS(false);
  };

  function parseDamage(expr){
    const m=String(expr||'').trim().toLowerCase().match(/^(\d+)d(\d+)(?:x(\d+))?(?:\s*([+-])\s*(\d+))?$/);
    if(!m)return null;
    const count=Number(m[1]),sides=Number(m[2]),mult=Number(m[3]||1),flat=(m[4]? (m[4]==='-'?-1:1)*Number(m[5]):0);
    if(count<1||count>100||sides<2||sides>1000)return null;
    let base=0,rolls=[];for(let i=0;i<count;i++){const r=rollDie(sides);rolls.push(r);base+=r;}
    return {rolls,base,mult,flat,total:base*mult+flat};
  }
  window.rollSSDamage=function(which){
    const expr=$(which===1?'ss-w1-damage':'ss-w2-damage')?.value||'';
    const name=$(which===1?'ss-w1-name':'ss-w2-name')?.value||`WEAPON ${which}`;
    const r=parseDamage(expr);
    if(!r){openCharacterModal(name+' DAMAGE','<div class="cs-rule-reference-text">Could not parse damage. Use forms like 4d10x2, 6d10, or 3d8+5.</div>','');return;}
    openCharacterModal(name+' DAMAGE',`<div class="cs-roll-result">${r.rolls.join(' + ')}${r.mult!==1?' × '+r.mult:''}${r.flat? ' '+signed(r.flat):''} = <b>${r.total}</b></div>`,'');
  };

  console.log('[DESTINY STARSHIP v1.7] combat console loaded');
})();