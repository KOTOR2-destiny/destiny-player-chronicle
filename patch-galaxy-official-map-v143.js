(()=>{'use strict';
// The supplied map is 1080 x 1408. Keep its intrinsic aspect ratio: marker percentages
// refer to the image, never to a stretched or cropped container.
const css=document.createElement('style');css.textContent=`
#galaxy-map.galaxy-map-wrap{width:100%;height:auto;min-height:0;aspect-ratio:1080/1408;box-sizing:border-box;overflow:visible;background:#030b12 url('galaxy-map-clean.png?v=20260917-1919') center center/100% 100% no-repeat}
#galaxy-map .galaxy-regions,#galaxy-map .galaxy-grid,#galaxy-map .galaxy-route{display:none!important}
#galaxy-map .galaxy-marker{z-index:8;min-width:24px;min-height:24px}
#galaxy-map .galaxy-label{font-size:9px;background:rgba(0,12,21,.82);border-radius:3px;padding:2px 4px;top:22px;color:#d4faff}
@media(max-width:900px){#galaxy-map.galaxy-map-wrap{min-height:0}}
`;document.head.appendChild(css);
// The previous map's coordinates were percentages of an invented landscape atlas.
// Use the uploaded image's galactic grid instead. The grid's column and row centers
// are 67.5px and ~67px apart respectively, with G = first column and row 1 = first row.
const precise={
'coruscant':[336,604], 'kashyyyk':[673,591], 'sullust':[444,1131],
'dantooine':[340,220]
};
function position(record){const name=String(record.name||'').trim().toLowerCase();if(precise[name])return precise[name];const match=/^([G-U])\s*[-–]\s*(\d{1,2})$/i.exec(String(record.galaxy_grid||''));if(!match)return null;const col=match[1].toUpperCase().charCodeAt(0)-71,row=Number(match[2]);if(row<1||row>21)return null;return [(col+.5)*1080/16,(row-.5)*1408/21]}
function relocate(){const map=document.getElementById('galaxy-map');if(!map)return;const records=(typeof chronicleState!=='undefined'&&Array.isArray(chronicleState.locations))?chronicleState.locations:[];map.querySelectorAll('.galaxy-route').forEach(el=>el.remove());map.querySelectorAll('.galaxy-marker').forEach(marker=>{const name=marker.querySelector('.galaxy-label')?.textContent?.trim().toLowerCase();const record=records.find(l=>String(l.name||'').trim().toLowerCase()===name);if(!record)return;const xy=position(record);if(!xy){marker.hidden=true;return}marker.hidden=false;marker.style.left=(xy[0]/1080*100)+'%';marker.style.top=(xy[1]/1408*100)+'%';marker.classList.remove('current')})}
function init(){const map=document.getElementById('galaxy-map');if(!map)return false;const observer=new MutationObserver(relocate);observer.observe(map,{childList:true});relocate();const toggle=document.getElementById('galaxy-route-toggle');if(toggle){toggle.textContent='CREW TRAVEL LOG: NOT YET AVAILABLE';toggle.disabled=true;toggle.title='Travel order has not been recorded; no route is inferred from database order.'}return true}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{if(!init()){const observer=new MutationObserver(()=>{if(init())observer.disconnect()});observer.observe(document.documentElement,{childList:true,subtree:true})}},{once:true});else if(!init()){const observer=new MutationObserver(()=>{if(init())observer.disconnect()});observer.observe(document.documentElement,{childList:true,subtree:true})}
})();