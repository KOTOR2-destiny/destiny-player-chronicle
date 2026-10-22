/* Explicit player-visible projection. Never serialize the sheet or clone the page. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./character-export-calculator-v1.js'));else root.DestinyExportModel=factory(root.DestinyExportCalculator)})(globalThis,function(calculate){
'use strict';
const version='1.0.0',unavailable='Unavailable',signed=n=>n==null?unavailable:(n>=0?'+':'')+n;
const labels={
 'cs-character-name':'Character name','cs-player-name':'Player','cs-species':'Species','cs-destiny':'Destiny','cs-xp':'XP',
 'cs-max-hp':'Maximum HP','cs-current-hp':'Current HP','cs-condition':'Current condition','cs-force-points':'Current Force Points','cs-destiny-points':'Current Destiny Points',
 'cs-armor-name':'Armor','cs-armor-ref':'Armor Reflex bonus','cs-armor-fort':'Armor Fortitude bonus','cs-armor-maxdex':'Maximum Dexterity bonus','cs-temp-dex':'Temporary Dexterity',
 'cs-armor-worn':'Armor worn','cs-armor-proficient':'Armor proficient','cs-armored-defense':'Armored Defense','cs-improved-armored-defense':'Improved Armored Defense','cs-armor-mastery':'Armor Mastery','cs-second-skin':'Second Skin',
 'cs-misc-ref':'Miscellaneous Reflex','cs-misc-fort':'Miscellaneous Fortitude','cs-misc-will':'Miscellaneous Will','cs-other-bab':'Legacy Other BAB',
 'cs-feats':'Feats','cs-talents':'Talents','cs-force-powers':'Force powers','cs-force-techniques':'Force techniques','cs-force-secrets':'Force secrets','cs-languages':'Languages','cs-equipment':'Equipment and inventory','cs-notes':'Notes and special qualities'
};
const value=v=>v==null||v===''?unavailable:typeof v==='boolean'?(v?'Yes':'No'):String(v);
function safeFields(raw){const f={};for(const [k,v]of Object.entries(raw||{})){if((Object.hasOwn(labels,k)||/^cs-(?:str|dex|con|int|wis|cha)-(?:base|other)$/.test(k)||/^cs-class-(?:jedi|noble|scoundrel|scout|soldier|other)$/.test(k)||/^cs-skill-(?:trained|misc)-(?:[0-9]|1[0-9]|2[0-4])$/.test(k))&&['string','number','boolean'].includes(typeof v))f[k]=v}return f}
function normalize(record,rules,{at=new Date().toISOString(),timeZone='America/Chicago',rested=false}={}){
 if(!record?.sheet||!rules)throw Error('Saved character data or calculation rules are unavailable.');
 if(JSON.stringify(record.sheet).length>2000000)throw Error('This sheet exceeds the 2 MB export limit. Please contact the GM.');
 const raw=record.sheet,f=safeFields(raw.fields),weapons=Array.isArray(raw.weapons)?raw.weapons:[];
 if(weapons.length>1000)throw Error('This sheet exceeds the 1,000 weapon export limit.');
 const a=raw.advancement||{},sheet={fields:f,weapons,advancement:{classes:a.classes||{}}};
 if(rested){sheet.fields={...f,'cs-temp-dex':''};}
 const s=calculate(sheet,rules),read=id=>value(f[id]);
 const numeric=id=>f[id]!=null&&f[id]!==''&&Number.isFinite(Number(f[id]));
 const missingAbilities=s.abilities.filter(a=>!numeric('cs-'+a.key+'-base')||!numeric('cs-'+a.key+'-other')).map(a=>a.key);
 const classKeys=['jedi','noble','scoundrel','scout','soldier','other'],classKnown=classKeys.every(k=>f['cs-class-'+k]!=null&&f['cs-class-'+k]!==''&&Number.isFinite(Number(f['cs-class-'+k])));
 const known=(ability)=>classKnown&&!missingAbilities.includes(ability);
 if(!classKnown){s.level=null;s.bab=null;}
 if(!known('dex'))s.ref=null;if(!known('con')){s.fort=null;s.threshold=null}if(!known('wis'))s.will=null;
 if(!numeric('cs-misc-ref')||typeof f['cs-armor-worn']!=='boolean')s.ref=null;
 if(!numeric('cs-misc-fort')||typeof f['cs-armor-worn']!=='boolean')s.fort=null;
 if(!numeric('cs-misc-will'))s.will=null;
 if(f['cs-armor-worn']&&(!numeric('cs-armor-ref')||!Object.hasOwn(f,'cs-armor-maxdex')))s.ref=null;
 if(f['cs-armor-worn']&&!numeric('cs-armor-fort'))s.fort=null;
 if(s.fort==null)s.threshold=null;
 if(!Object.hasOwn(f,'cs-species')){s.speed=null;s.ref=null;s.fort=null;s.will=null;s.threshold=null;}
 for(const x of s.abilities)if(missingAbilities.includes(x.key)){x.score=null;x.modifier=null}
 for(const [i,x]of s.skills.entries()){if(!Object.hasOwn(f,'cs-skill-trained-'+i))x.trained=null;if(!known(x.ability)||x.trained==null||!numeric('cs-skill-misc-'+i))x.total=null;}
 for(const x of s.weapons)if(!known('str')||!known('dex')){x.attack=null;x.damage=unavailable}
 const classes=Object.entries(s.classes).filter(([,n])=>n>0).map(([n,v])=>n+' '+v);
 const named=Object.entries(s.classes).filter(([n])=>rules.classes[n]?.prestige).reduce((t,[,v])=>t+v,0),legacy=Number(f['cs-class-other'])-named;if(legacy>0)classes.push('Other / Prestige '+legacy+' (unmapped)');
 const sections=[],add=(title,rows)=>sections.push({title,rows:rows.map(r=>r.map(value))});
 add('Character',[['Name',read('cs-character-name')],['Player',read('cs-player-name')],['Species',read('cs-species')],['Classes',classKnown?(classes.join(' / ')||'No heroic levels'):unavailable],['Heroic level',s.level],['Destiny',read('cs-destiny')],['XP',read('cs-xp')]]);
 add('Abilities',s.abilities.map(x=>[x.name,value(x.score)+' ('+signed(x.modifier)+') | Base '+read('cs-'+x.key+'-base')+' | Other '+read('cs-'+x.key+'-other')]));
 const forceVisible=Number(f['cs-class-jedi'])>0||/force sensitivity/i.test(f['cs-feats']||'')||!!f['cs-force-powers'];
 const combat=[['Maximum HP',read('cs-max-hp')],['Current HP',read('cs-current-hp')],['Current condition',read('cs-condition')],['Reflex',s.ref],['Fortitude',s.fort],['Will',s.will],['Damage threshold',s.threshold],['Base attack',signed(s.bab)],['Speed in squares',s.speed],['Current Destiny Points',read('cs-destiny-points')]];
 if(forceVisible){combat.push(['Current Force Points',read('cs-force-points')]);if(a.darkSideScore!=null)combat.push(['Dark Side Score',value(a.darkSideScore)]);}
 if(Number(f['cs-class-other'])>0)combat.push(['Legacy Other BAB contribution',read('cs-other-bab')]);
 add(rested?'Combat readiness at normal Dexterity':'Combat and saved current state',combat);
 add('Defense calculation details',s.breakdowns.map((b,i)=>[['Reflex','Fortitude','Will'][i], [s.ref,s.fort,s.will][i]==null?unavailable:b]));
 add('Weapons',s.weapons.length?s.weapons.map(x=>[value(x.name),value(x.type)+' | Attack '+signed(x.attack)+' | Damage '+value(x.damage)+(x.both!=null?' | Both ends '+signed(x.both)+' per attack':'')+(x.effects?' | '+x.effects:'')]):[['Weapons',unavailable]]);
 add('Skills',s.skills.filter(x=>x.name!=='Use the Force'||forceVisible).map(x=>[x.name,signed(x.total)+' | '+(x.trained==null?'Training unavailable':x.trained?'Trained':'Untrained')+' | Misc '+value(x.misc)]));
 if(forceVisible&&f['cs-force-powers']){const counts={},spent=new Set(Array.isArray(raw.forcePowerSuite?.spent)?raw.forcePowerSuite.spent:[]);add('Current power availability',String(f['cs-force-powers']).split(/\n|;/).map(x=>x.trim()).filter(Boolean).map(name=>{const key=name.toLowerCase(),i=counts[key]||0;counts[key]=i+1;return [name+' · use '+(i+1),spent.has(key+'::'+i)?'Spent':'Available']}));}
 add('Armor and adjustments',Object.entries(labels).filter(([id])=>/^(cs-armor-|cs-armored-|cs-improved-armored-|cs-second-skin|cs-misc-|cs-temp-)/.test(id)).map(([id,label])=>[label,read(id)]));
 for(const id of ['cs-feats','cs-talents','cs-force-powers','cs-force-techniques','cs-force-secrets','cs-languages','cs-equipment','cs-notes']){
  if(id.startsWith('cs-force-')&&!forceVisible)continue;
  if(id.startsWith('cs-force-')&&!f[id])continue;
  add(labels[id],[[labels[id],read(id)]]);
 }
 const features=Array.isArray(a.classFeatures)?a.classFeatures:[];
 if(features.length)add('Class features',features.map(x=>[x.name,[x.className,x.classLevel].filter(v=>v!=null).join(' ')]));
 // Include only descriptions of owned entries; never include a rules catalog or module state.
 const owned=new Set(['cs-feats','cs-talents',...(forceVisible?['cs-force-powers','cs-force-techniques','cs-force-secrets']:[])].flatMap(id=>String(f[id]||'').split(/\n|;/).map(n=>n.trim().toLowerCase())));
 const refs=(rules.rules||[]).filter(r=>owned.has(String(r.name).toLowerCase()));
 if(refs.length)add('Owned ability references',refs.map(r=>[r.name,[r.description,r.source?.name,r.source?.url].filter(Boolean).join('\n')]));
 const metadata=[['Exported',new Date(at).toLocaleString('en-US',{timeZone})+' ('+timeZone+')'],['Last saved',value(record.updated_at)],['Character reference',value(record.id)],['Sheet version',value(raw.version)],['Export version',version],['State',rested?'Normal Dexterity; maximum HP is the planning baseline. Current resources are labeled separately.':'Latest committed record. Unsaved changes are excluded.']];
 add('Record information',metadata);
 return {version,name:f['cs-character-name']||record.character_name||'Character',id:record.id,at,timeZone,sections,stats:s,classes:classes.join(' / '),hp:{max:f['cs-max-hp']??null,current:f['cs-current-hp']??null},updatedAt:record.updated_at};
}
function filename(model,extension){const name=String(model.name).normalize('NFKC').replace(/[^\p{L}\p{N}_-]+/gu,'_').replace(/^[_-]+|[_-]+$/g,'').slice(0,70)||'Character';const date=new Intl.DateTimeFormat('en-CA',{timeZone:model.timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(model.at));return name+'_Level_'+(model.stats.level==null?'Unknown':String(model.stats.level).padStart(2,'0'))+'_'+date+'.'+extension}
function reviews(record,rules){const history=record.sheet?.advancement?.history;if(!Array.isArray(history))return [];const seen=new Set();return history.filter(e=>e?.id&&!seen.has(e.id)&&seen.add(e.id)).map(e=>{
 const before=e.beforeSnapshot;if(!before?.fields)return {id:e.id,at:e.at,status:e.revertedAt?'Reverted':'Recorded',title:'Advancement record',rows:[['Details','Unavailable for this older event']]};
 const after=JSON.parse(JSON.stringify(before));after.advancement={...(after.advancement||{}),classes:e.afterClasses||{},classFeatures:e.afterFeatures||[]};
 for(const [id,c]of Object.entries(e.changes||{}))after.fields[id]=c.after;
 const b=normalize({...record,sheet:before},rules),n=normalize({...record,sheet:after},rules),rows=[];
 for(const key of ['level','bab','ref','fort','will','threshold'])if(b.stats[key]!==n.stats[key])rows.push([({level:'Heroic level',bab:'BAB',ref:'Reflex',fort:'Fortitude',will:'Will',threshold:'Damage threshold'})[key],value(b.stats[key])+' → '+value(n.stats[key])]);
 for(const [id,c]of Object.entries(e.changes||{})){if(JSON.stringify(c.before)===JSON.stringify(c.after))continue;if(labels[id]||/^cs-(?:str|dex|con|int|wis|cha)-/.test(id))rows.push([labels[id]||id.replace('cs-',''),value(c.before)+' → '+value(c.after)])}
 for(const [i,x]of b.stats.skills.entries())if(x.total!==n.stats.skills[i].total)rows.push([x.name,signed(x.total)+' → '+signed(n.stats.skills[i].total)]);
 if(JSON.stringify(e.beforeSnapshot.advancement?.classFeatures||[])!==JSON.stringify(e.afterFeatures||[]))rows.push(['Class features',(e.afterFeatures||[]).map(x=>x.name).join(', ')]);
 return {id:e.id,at:e.at,revertedAt:e.revertedAt,status:e.revertedAt?'Reverted':'Recorded',title:e.className+' '+e.classLevel+' · Level '+e.fromLevel+' → '+e.toLevel,rows};
}).sort((a,b)=>String(b.revertedAt||b.at).localeCompare(String(a.revertedAt||a.at)))}
return {version,labels,value,signed,safeFields,normalize,filename,reviews};
});
