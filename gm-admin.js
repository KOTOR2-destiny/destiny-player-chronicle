// Galactic Database image-management revision
(() => {
  'use strict';
  const cfg = window.DESTINY_GM_CONFIG;
  if (!cfg || !cfg.url || !cfg.key) { document.body.innerHTML = '<main><section class="card error">GM portal configuration is unavailable.</section></main>'; return; }
  const db = window.supabase.createClient(cfg.url, cfg.key);
  const tables = ['npcs','locations','factions','missions','sessions','discoveries'];
  const longFields = new Set(['description','relationship','player_notes','briefing','objectives','discoveries','outcome','rewards','summary','key_events','loot','consequences','significance','capabilities','clues','crew_history','goals','resources']);
  const readonlyFields = new Set(['created_at','updated_at']);
  let currentTable = 'npcs', rows = [], current = null;
  const $ = id => document.getElementById(id);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const displayName = r => r.name || r.title || (r.number != null ? `Session ${r.number}` : r.id) || 'Untitled';
  const status = (id, text, error=false) => { const el=$(id); el.textContent=text; el.className=error?'error':'ok'; };

  async function authorize() {
    const { data:{ user } } = await db.auth.getUser();
    if (!user) { $('login').classList.remove('hidden'); $('app').classList.add('hidden'); return; }
    const { data, error } = await db.rpc('is_gm');
    if (error || data !== true) { await db.auth.signOut(); $('login').classList.remove('hidden'); $('app').classList.add('hidden'); status('loginMessage','This account is not authorized as the Destiny GM.',true); return; }
    $('login').classList.add('hidden'); $('app').classList.remove('hidden'); $('identity').textContent = `AUTHORIZED GM // ${user.email || user.id}`; buildTabs(); await loadRows();
  }

  function buildTabs() {
    const nav=$('tabs'); nav.innerHTML='';
    for (const t of tables) { const b=document.createElement('button'); b.textContent=t.toUpperCase(); b.className=t===currentTable?'active':''; b.onclick=async()=>{currentTable=t;current=null;$('editor').classList.add('hidden');buildTabs();await loadRows();}; nav.appendChild(b); }
  }

  async function loadRows() {
    $('records').innerHTML='<div>SCANNING DATABASE…</div>';
    const {data,error}=await db.from(currentTable).select('*');
    if(error){$('records').innerHTML=`<div class="error">${escapeHtml(error.message)}</div>`;return;}
    rows=data||[]; renderRows();
  }

  function renderRows() {
    const q=$('search').value.trim().toLowerCase(), host=$('records'); host.innerHTML='';
    const filtered=rows.filter(r=>JSON.stringify(r).toLowerCase().includes(q));
    for(const r of filtered){const d=document.createElement('div');d.className='record';d.innerHTML=`<strong>${escapeHtml(displayName(r))}</strong><small>${escapeHtml(r.status||r.type||r.planet||r.category||r.description||r.summary||'DATABASE RECORD')}</small>`;d.onclick=()=>openEditor(r);host.appendChild(d);}
    if(!filtered.length)host.innerHTML='<div>NO MATCHING RECORDS.</div>';
  }

  function inferTemplate() {
    if(rows[0]) { const o={}; for(const k of Object.keys(rows[0])) if(!readonlyFields.has(k)) o[k]=k==='id'?'':(typeof rows[0][k]==='number'?null:''); return o; }
    return {id:'',name:'',image_path:''};
  }

  function openEditor(record=null) {
    current=record;
    $('editorTitle').textContent=(record?'EDIT // ':'NEW // ')+currentTable.toUpperCase();
    $('fields').innerHTML=''; const obj=record?structuredClone(record):inferTemplate();
    for(const [key,value] of Object.entries(obj)){
      if(readonlyFields.has(key))continue;
      const wrap=document.createElement('div'); wrap.className='field'+(longFields.has(key)?' long':'');
      const label=document.createElement('label');label.textContent=key.replaceAll('_',' ');wrap.appendChild(label);
      const input=longFields.has(key)?document.createElement('textarea'):document.createElement('input'); input.dataset.key=key;
      if(typeof value==='object' && value!==null) input.value=JSON.stringify(value); else input.value=value??'';
      wrap.appendChild(input);$('fields').appendChild(wrap);
    }
    $('deleteButton').classList.toggle('hidden',!record);$('editorMessage').textContent='';$('editor').classList.remove('hidden');$('editor').scrollIntoView({behavior:'smooth'});
  }

  function collect() {
    const obj={}; for(const input of $('fields').querySelectorAll('[data-key]')){let v=input.value,key=input.dataset.key;if(v.trim().startsWith('[')||v.trim().startsWith('{')){try{v=JSON.parse(v)}catch{}}obj[key]=v;} return obj;
  }

  async function save() {
    const obj=collect(); let result;
    if(current){const id=current.id;if(id==null){status('editorMessage','Cannot safely update a record without an ID.',true);return;}delete obj.id;result=await db.from(currentTable).update(obj).eq('id',id).select();}
    else {if(!obj.id)obj.id=`gm-${currentTable}-${Date.now()}`;result=await db.from(currentTable).insert(obj).select();}
    if(result.error){status('editorMessage',result.error.message,true);return;} status('editorMessage','RECORD SYNCHRONIZED TO LIVE CHRONICLE.'); await loadRows(); if(result.data?.[0])openEditor(result.data[0]);
  }

  async function remove() {
    if(!current?.id)return;if(!confirm(`Delete ${displayName(current)} from the live Chronicle database?`))return;
    const {error}=await db.from(currentTable).delete().eq('id',current.id);if(error){status('editorMessage',error.message,true);return;}current=null;$('editor').classList.add('hidden');await loadRows();
  }

  $('loginButton').onclick=async()=>{const email=$('email').value.trim();if(!email){status('loginMessage','Enter your authorized email.',true);return;}const {error}=await db.auth.signInWithOtp({email,options:{emailRedirectTo:location.href.split('#')[0],shouldCreateUser:false}});status('loginMessage',error?error.message:'SECURE LOGIN LINK TRANSMITTED.',!!error);};
  $('logoutButton').onclick=async()=>{await db.auth.signOut();location.reload();}; $('reloadButton').onclick=loadRows; $('search').oninput=renderRows; $('newButton').onclick=()=>openEditor(); $('cancelButton').onclick=()=>$('editor').classList.add('hidden'); $('saveButton').onclick=save; $('deleteButton').onclick=remove;
  db.auth.onAuthStateChange(()=>setTimeout(authorize,0)); authorize();
})();
