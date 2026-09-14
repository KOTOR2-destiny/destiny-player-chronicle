(()=>{
const norm=v=>String(v||'').trim().toLowerCase();
const isProficiency=n=>/^(weapon|armor) proficiency\s*\(/i.test(String(n||''));
document.addEventListener('click',ev=>{
 const b=ev.target.closest?.('.saga-add');
 if(!b||!isProficiency(b.dataset.name))return;
 ev.preventDefault();ev.stopImmediatePropagation();
 const name=b.dataset.name;
 const el=document.getElementById('cs-feats');
 if(!el)return;
 const existing=(typeof normalizedLines==='function'?normalizedLines(el.value||''):(el.value||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean));
 if(existing.some(x=>norm(x)===norm(name))){alert(name+' is already on this character.');return;}
 const old=el.value.trim();
 el.value=old+(old?'\n':'')+name;
 el.dispatchEvent(new Event('input',{bubbles:true}));
 if(typeof renderRuleChips==='function')renderRuleChips();
 b.textContent='ADDED ✓';b.disabled=true;
},true);
console.log('[DESTINY v1.33.1] distinct Weapon/Armor Proficiency variants enabled');
})();
