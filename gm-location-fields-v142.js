(()=>{
const types=['Planet','Moon','Space Station','City','Township / Settlement','District','Building / Site','Region / Territory','Other'];
const registry={
 'coruscant':{region:'Core Worlds',sector:'Corusca Sector',grid:'L-9',x:49.8,y:48.8},
 'odryn':{region:'Outer Rim Territories',sector:'Noonian Sector',grid:'N-7',x:61.8,y:34.5},
 'nar shaddaa':{region:'Hutt Space',sector:'Hutt Space',grid:'S-12',x:79.2,y:67.8},
 'tatooine':{region:'Outer Rim Territories',sector:'Arkanis Sector',grid:'R-16',x:75,y:86},
 'kashyyyk':{region:'Mid Rim',sector:'Mytaranor Sector',grid:'P-9',x:68,y:49},
 'korriban':{region:'Outer Rim Territories',sector:'Horuset system',grid:'R-5',x:77,y:25.5},
 'sullust':{region:'Outer Rim Territories',sector:'Sullust Sector',grid:'M-17',x:56,y:91},
 'dantooine':{region:'Outer Rim Territories',sector:'Raioballo Sector',grid:'L-4',x:48,y:20.5},
 'dxun':{region:'Inner Rim',sector:'Japrael Sector',grid:'O-9',x:65,y:49.5},
 'telos iv':{region:'Outer Rim Territories',sector:'Telos Sector',grid:'Q-4',x:72.5,y:20},
 'telos':{region:'Outer Rim Territories',sector:'Telos Sector',grid:'Q-4',x:72.5,y:20},
 'malachor v':{region:'Outer Rim Territories',sector:'Malachor system',grid:'S-4',x:81.5,y:20.5},
 'malachor':{region:'Outer Rim Territories',sector:'Malachor system',grid:'S-4',x:81.5,y:20.5}
};
const $=(root,key)=>root.querySelector('[data-key="'+key+'"]');
function convert(input,values,empty){if(!input)return input;if(input.tagName==='SELECT')return input;const select=document.createElement('select');select.dataset.key=input.dataset.key;select.innerHTML='<option value="">'+empty+'</option>'+values.map(v=>'<option value="'+v+'">'+v+'</option>').join('');select.value=input.value;input.replaceWith(select);return select;}
function yesNo(input){if(!input)return input;if(input.tagName==='SELECT')return input;const select=document.createElement('select');select.dataset.key=input.dataset.key;select.innerHTML='<option value="false">NO</option><option value="true">YES</option>';select.value=String(input.value).toLowerCase()==='true'?'true':'false';input.replaceWith(select);return select;}
function setValue(root,key,value){const e=$(root,key);if(e)e.value=value??'';}
function lockMapFields(root,locked){['sector','galaxy_grid','map_x','map_y'].forEach(k=>{const e=$(root,k);if(!e)return;e.readOnly=locked;e.style.opacity=locked?'.72':'1';e.title=locked?'Auto-populated from the Campaign Map Registry.':'';});}
function mapStatus(root,text,bad=false){let el=document.getElementById('galaxyAutoStatus');if(!el){el=document.createElement('div');el.id='galaxyAutoStatus';el.className='field long';const target=$(root,'show_on_galaxy_map')?.closest('.field');(target?.parentNode||root).insertBefore(el,target?.nextSibling||null);}el.innerHTML='<label>GALAXY MAP REGISTRY</label><div style="border:1px solid '+(bad?'#8b3d45':'#245f6f')+';background:#031d28;padding:10px;color:'+(bad?'#ffb8bf':'#9af1ff')+';line-height:1.45">'+text+'</div>';}
function populate(root){const show=$(root,'show_on_galaxy_map');if(!show||show.value!=='true'){lockMapFields(root,false);document.getElementById('galaxyAutoStatus')?.remove();return;}const name=($(root,'name')?.value||'').trim().toLowerCase();const rec=registry[name];if(!rec){lockMapFields(root,false);mapStatus(root,'NO PRE-REGISTERED MAP POSITION FOUND FOR THIS WORLD. ENTER SECTOR / GRID / MAP X / MAP Y MANUALLY, THEN SAVE.',true);return;}setValue(root,'region',rec.region);setValue(root,'sector',rec.sector);setValue(root,'galaxy_grid',rec.grid);setValue(root,'map_x',rec.x);setValue(root,'map_y',rec.y);lockMapFields(root,true);mapStatus(root,'AUTO-LOCATED // '+rec.grid+' // '+rec.region+(rec.sector?' // '+rec.sector:'')+' — coordinates will publish when you SAVE TO CHRONICLE.');}
function refresh(){const fields=document.getElementById('fields');if(!fields)return;const active=[...document.querySelectorAll('#tabs button.active')][0];if(!active||active.textContent.trim()!=='LOCATIONS')return;const type=$(fields,'type'),planet=$(fields,'planet'),parent=$(fields,'parent_location');if(!type||!planet||!parent)return;
 const ts=convert(type,types,'SELECT LOCATION TYPE...');ts.closest('.field').querySelector('label').textContent='LOCATION TYPE';planet.closest('.field').querySelector('label').textContent='PLANET / WORLD (LEGACY)';
 const names=[...document.querySelectorAll('#records .record strong')].map(x=>x.textContent.trim());const ps=convert(parent,names,'NO PARENT / TOP-LEVEL LOCATION');ps.closest('.field').querySelector('label').textContent='PARENT LOCATION';
 const show=yesNo($(fields,'show_on_galaxy_map'));if(show){show.closest('.field').querySelector('label').textContent='SHOW ON GALAXY MAP';if(!show.dataset.bound){show.dataset.bound='1';show.addEventListener('change',()=>populate(fields));}}
 ['discovered','visited'].forEach(k=>{const s=yesNo($(fields,k));if(s)s.closest('.field').querySelector('label').textContent=k.toUpperCase();});
 const name=$(fields,'name');if(name&&!name.dataset.mapBound){name.dataset.mapBound='1';name.addEventListener('change',()=>populate(fields));name.addEventListener('blur',()=>populate(fields));}
 const toggle=()=>{const celestial=ts.value==='Planet'||ts.value==='Moon';planet.closest('.field').style.display=celestial?'none':'';ps.closest('.field').style.display=celestial?'none':'';['sector','galaxy_grid','map_x','map_y','show_on_galaxy_map','discovered','visited'].forEach(k=>{const e=$(fields,k);if(e)e.closest('.field').style.display=celestial?'':'none';});if(celestial)populate(fields);else document.getElementById('galaxyAutoStatus')?.remove();};
 if(!ts.dataset.bound){ts.dataset.bound='1';ts.addEventListener('change',toggle);}toggle();}
document.addEventListener('click',()=>setTimeout(refresh,0));setInterval(refresh,700);
})();