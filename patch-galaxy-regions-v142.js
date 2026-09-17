(()=>{
'use strict';
function installRegionAtlas(){
 const map=document.getElementById('galaxy-map');
 if(!map)return;
 const old=map.querySelector('.galaxy-regions');if(old)old.style.display='none';
 if(map.querySelector('.galaxy-atlas-regions'))return;
 const wrap=document.createElement('div');wrap.className='galaxy-atlas-regions';
 wrap.innerHTML=`<svg viewBox="0 0 1000 650" preserveAspectRatio="none" aria-label="Galactic region guide">
 <defs>
  <filter id="softGlow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 </defs>
 <!-- These contours are intentionally irregular, following the Essential Atlas regional geography rather than false concentric rings. -->
 <path class="gr-fill gr-unknown" d="M0,0 L255,0 C235,72 248,129 220,190 C196,244 209,310 180,365 C151,421 166,505 130,650 L0,650 Z"/>
 <path class="gr-line gr-outer" d="M175,42 C296,4 465,9 617,37 C761,63 904,141 966,251 C1018,344 976,475 877,555 C774,637 599,655 443,625 C306,599 197,526 151,431 C108,342 122,223 175,42 Z"/>
 <path class="gr-line gr-mid" d="M318,166 C393,119 486,106 565,130 C621,147 646,187 683,221 C726,261 790,278 803,331 C817,389 769,445 710,478 C641,517 552,528 470,501 C394,476 337,427 307,366 C276,304 275,222 318,166 Z"/>
 <path class="gr-line gr-expansion" d="M365,218 C419,177 488,166 544,184 C591,199 610,235 638,270 C666,305 707,329 699,370 C691,413 648,445 600,459 C545,476 482,465 437,438 C392,411 360,371 346,326 C333,284 336,246 365,218 Z"/>
 <path class="gr-line gr-inner" d="M398,254 C439,219 490,210 531,225 C566,238 581,267 600,297 C619,326 648,348 638,379 C628,410 594,431 556,438 C512,446 467,433 436,410 C404,386 383,351 378,318 C374,291 379,271 398,254 Z"/>
 <path class="gr-line gr-colonies" d="M425,279 C455,251 492,244 522,255 C548,265 559,287 571,311 C584,335 603,353 593,376 C583,400 557,414 529,417 C496,421 464,409 443,390 C421,371 408,345 407,321 C406,301 412,291 425,279 Z"/>
 <path class="gr-line gr-core" d="M449,300 C469,281 494,276 514,284 C532,291 539,307 546,325 C554,342 566,355 558,372 C550,389 532,398 512,399 C489,400 467,391 453,377 C438,363 430,344 431,327 C432,315 438,307 449,300 Z"/>
 <path class="gr-line gr-deep" d="M475,318 C487,308 501,306 511,312 C521,318 526,328 527,339 C529,350 525,360 515,366 C504,373 490,371 481,363 C471,355 467,343 469,333 C470,327 472,322 475,318 Z"/>
 <g class="gr-labels" filter="url(#softGlow)">
  <text x="55" y="320">UNKNOWN REGIONS</text>
  <text x="765" y="155">OUTER RIM</text>
  <text x="700" y="445">MID RIM</text>
  <text x="610" y="430">EXPANSION REGION</text>
  <text x="565" y="285">INNER RIM</text>
  <text x="430" y="405">COLONIES</text>
  <text x="455" y="295">CORE WORLDS</text>
  <text x="474" y="346">DEEP CORE</text>
 </g>
 </svg>`;
 const grid=map.querySelector('.galaxy-grid');map.insertBefore(wrap,grid||map.firstChild);
 const style=document.createElement('style');style.textContent=`.galaxy-atlas-regions{position:absolute;inset:0;z-index:1;pointer-events:none}.galaxy-atlas-regions svg{width:100%;height:100%;display:block}.gr-fill{stroke:none}.gr-unknown{fill:rgba(111,72,155,.10)}.gr-line{fill:rgba(37,129,151,.018);stroke:rgba(112,218,238,.30);stroke-width:1.2;vector-effect:non-scaling-stroke}.gr-outer{stroke:rgba(112,218,238,.22)}.gr-mid{stroke:rgba(112,218,238,.27)}.gr-expansion{stroke-dasharray:5 3;stroke:rgba(116,208,224,.31)}.gr-inner{stroke:rgba(135,224,239,.34)}.gr-colonies{stroke-dasharray:3 2;stroke:rgba(147,230,243,.36)}.gr-core{fill:rgba(90,191,211,.035);stroke:rgba(159,241,255,.42)}.gr-deep{fill:rgba(159,241,255,.07);stroke:rgba(190,248,255,.48)}.gr-labels text{fill:rgba(157,224,235,.63);font:700 9px Arial,sans-serif;letter-spacing:1.5px}.gr-labels text:first-child{fill:rgba(204,174,239,.66)}.galaxy-region-key{display:none!important}.galaxy-grid{z-index:2}.galaxy-marker{z-index:5!important}.galaxy-route{z-index:4!important}`;document.head.appendChild(style);
}
function updateKey(){const toolbar=document.querySelector('#galaxy-section .galaxy-toolbar');if(!toolbar||document.getElementById('galaxy-atlas-key'))return;const key=document.createElement('div');key.id='galaxy-atlas-key';key.style.cssText='width:100%;margin-top:3px;color:#6fa4af;font-size:8px;letter-spacing:.75px;line-height:1.7';key.textContent='REGIONS // DEEP CORE · CORE WORLDS · COLONIES · INNER RIM · EXPANSION REGION · MID RIM · OUTER RIM · UNKNOWN REGIONS';toolbar.appendChild(key)}
function init(){installRegionAtlas();updateKey()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0),{once:true});else setTimeout(init,0);
})();