/* DESTINY PLAYER CHRONICLE — ASK THE CHRONICLER v1.40 */
(function(){
'use strict';
const audio=new Audio();
let base='http://127.0.0.1:7877';
function text(v){return String(v==null?'':v).trim()}
function status(msg){const e=document.querySelector('.chronicler-status');if(e)e.textContent=msg||''}
function playerText(s){
 const out=[];
 const fields=[['Official session summary',s.summary],['Key events',s.key_events],['NPCs encountered',s.npcs],['Locations visited',s.locations],['Factions involved',s.factions],['Missions advanced or completed',s.missions],['Discoveries and revelations',s.discoveries],['Loot and rewards',s.loot],['Known consequences',s.consequences],['Official player notes',s.player_notes]];
 const heading=(s.number?'Session '+text(s.number)+'. ':'')+text(s.title||'Untitled Session');if(heading)out.push(heading+'.');
 if(text(s.date))out.push('Date. '+text(s.date)+'.');
 fields.forEach(x=>{if(text(x[1]))out.push(x[0]+'. '+text(x[1]))});return out.join('\n\n');
}
async function findService(){for(let p=7877;p<=7896;p++){try{const b='http://127.0.0.1:'+p;const r=await fetch(b+'/health',{cache:'no-store'});if(r.ok){base=b;return true}}catch(e){}}return false}
async function play(){
 const s=(chronicleState.sessions||[]).find(x=>x.id===selectedSessionId);if(!s){status('SELECT A SESSION');return}
 status('CONTACTING THE CHRONICLER...');
 if(!await findService()){status('LOCAL CHRONICLER SERVICE NOT FOUND');return}
 status('PREPARING ARCHIVE RECORD...');
 try{
  const r=await fetch(base+'/narrate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({record_id:String(s.id||''),record_type:'session',title:text(s.title),player_text:playerText(s),published:true})});
  const j=await r.json();if(!r.ok)throw new Error(j.error||'Narration failed');
  const path=j.audio_url||j.audio||j.url;if(!path)throw new Error('No audio returned');
  audio.src=path.indexOf('http')===0?path:base+path;await audio.play();status('PLAYING ARCHIVE RECORD');
 }catch(e){console.error(e);status('CHRONICLER ERROR // '+(e.message||e))}
}
function install(){
 const dossier=document.getElementById('session-dossier');if(!dossier||dossier.querySelector('.chronicler-panel'))return;
 const header=dossier.querySelector('.dossier-header');if(!header)return;
 const panel=document.createElement('div');panel.className='chronicler-panel';
 panel.innerHTML='<div class="chronicler-title">HOLOCRON NARRATION INTERFACE</div><button class="chronicler-main" type="button">ASK THE CHRONICLER</button><div class="chronicler-controls"><button data-c="pause">PAUSE</button><button data-c="resume">RESUME</button><button data-c="restart">RESTART</button><button data-c="stop">STOP</button></div><div class="chronicler-status"></div>';
 header.insertAdjacentElement('afterend',panel);
 panel.querySelector('.chronicler-main').onclick=play;
 panel.querySelector('[data-c="pause"]').onclick=()=>{audio.pause();status('ARCHIVE PAUSED')};
 panel.querySelector('[data-c="resume"]').onclick=()=>{audio.play();status('PLAYING ARCHIVE RECORD')};
 panel.querySelector('[data-c="restart"]').onclick=()=>{audio.currentTime=0;audio.play();status('ARCHIVE RESTARTED')};
 panel.querySelector('[data-c="stop"]').onclick=()=>{audio.pause();audio.currentTime=0;status('ARCHIVE STOPPED')};
}
const style=document.createElement('style');style.textContent='.chronicler-panel{margin:12px 0 16px;padding:12px;border:1px solid #7c69d9;background:rgba(27,22,58,.78)}.chronicler-title{color:#c7bcff;font-size:9px;font-weight:bold;letter-spacing:2px;margin-bottom:8px}.chronicler-main{width:100%;min-height:40px;border:1px solid #9a7bff;background:rgba(34,24,62,.94);color:#eee9ff;font-weight:bold;letter-spacing:1.7px;cursor:pointer}.chronicler-controls{display:flex;gap:6px;margin-top:8px}.chronicler-controls button{cursor:pointer}.chronicler-status{margin-top:8px;color:#9ccbd3;font-size:8px;letter-spacing:1px}';document.head.appendChild(style);
let n=0,t=setInterval(()=>{n++;if(typeof window.renderSelectedSession==='function'){const old=window.renderSelectedSession;window.renderSelectedSession=function(){const r=old.apply(this,arguments);setTimeout(install,0);return r};clearInterval(t);install()}else if(n>100)clearInterval(t)},100);
audio.onended=()=>status('ARCHIVE RECORD COMPLETE');
})();