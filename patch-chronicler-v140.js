/* DESTINY PLAYER CHRONICLE — ASK THE CHRONICLER v1.40 */
(function(){
'use strict';
function install(){
 const dossier=document.getElementById('session-dossier');
 if(!dossier||dossier.querySelector('.chronicler-panel'))return;
 const header=dossier.querySelector('.dossier-header'); if(!header)return;
 const panel=document.createElement('div'); panel.className='chronicler-panel';
 panel.innerHTML='<div class="chronicler-title">HOLOCRON NARRATION INTERFACE</div><button class="chronicler-main" type="button">ASK THE CHRONICLER</button><div class="chronicler-controls" hidden><button>PAUSE</button><button>RESUME</button><button>RESTART</button><button>STOP</button></div><div class="chronicler-status"></div>';
 header.insertAdjacentElement('afterend',panel);
}
const style=document.createElement('style');style.textContent='.chronicler-panel{margin:12px 0 16px;padding:12px;border:1px solid #7c69d9;background:rgba(27,22,58,.78)}.chronicler-title{color:#c7bcff;font-size:9px;font-weight:bold;letter-spacing:2px;margin-bottom:8px}.chronicler-main{width:100%;min-height:40px;border:1px solid #9a7bff;background:rgba(34,24,62,.94);color:#eee9ff;font-weight:bold;letter-spacing:1.7px}.chronicler-controls{display:flex;gap:6px;margin-top:8px}.chronicler-status{margin-top:8px;font-size:8px}';document.head.appendChild(style);
let n=0,t=setInterval(()=>{n++;if(typeof window.renderSelectedSession==='function'){const old=window.renderSelectedSession;window.renderSelectedSession=function(){const r=old.apply(this,arguments);setTimeout(install,0);return r};clearInterval(t);install()}else if(n>100)clearInterval(t)},100);
})();