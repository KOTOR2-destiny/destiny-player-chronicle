/* Both formats consume the same text-only, allowlisted document model. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.DestinyExportRenderers=factory()})(globalThis,function(){
'use strict';
const navy='142E46',gold='A38745';
async function pdf(model,{PDFLib,fontkit,regular,bold}){
 const {PDFDocument,rgb}=PDFLib,doc=await PDFDocument.create();doc.registerFontkit(fontkit);
 const font=await doc.embedFont(regular,{subset:true}),strong=await doc.embedFont(bold,{subset:true});
 const supported=new Set(font.getCharacterSet());for(const section of model.sections)for(const row of section.rows)for(const text of row)for(const ch of text)if(!/\s/.test(ch)&&!supported.has(ch.codePointAt(0)))throw Error('PDF font cannot display '+ch+'. Export to Word to preserve this character.');
 const width=504,left=54,bottom=54;let page,y;
 const color=rgb(.08,.18,.27),muted=rgb(.28,.33,.38);
 function newPage(){page=doc.addPage([612,792]);y=727;page.drawText('DESTINY  /  PLAYER CHRONICLE',{x:left,y:756,font:strong,size:9,color});}
 function wrap(text,size,face,maxWidth){const lines=[];for(const raw of String(text).replace(/\r\n?/g,'\n').split('\n')){let line='';for(const word of raw.split(/(\s+)/)){if(!word)continue;let candidate=line+word;if(face.widthOfTextAtSize(candidate,size)<=maxWidth){line=candidate;continue}if(line.trim())lines.push(line.trimEnd());line='';for(const ch of word){if(face.widthOfTextAtSize(line+ch,size)>maxWidth){lines.push(line);line=''}line+=ch}}lines.push(line.trimEnd())}return lines}
 function line(text,{size=10,face=font,tint=muted,x=left}={}){if(y<bottom+16)newPage();if(text)page.drawText(text,{x,y,font:face,size,color:tint});y-=size*1.45;}
 function text(t,options={}){for(const l of wrap(t,options.size||10,options.face||font,width))line(l,options)}
 newPage();text(model.name,{size:24,face:strong,tint:color});text('CHARACTER RECORD',{size:10,face:strong});y-=12;
 for(const section of model.sections){if(y<bottom+85)newPage();y-=7;text(section.title,{size:14,face:strong,tint:color});y-=4;
  for(const [label,v]of section.rows){
   if(section.rows.length===1&&label===section.title){text(v,{size:10});y-=7;continue;}
   if(label.length<45&&v.length<180){const labels=wrap(label,9,strong,157),values=wrap(v,10,font,332),height=Math.max(labels.length,values.length)*15+8;if(y<bottom+height)newPage();const start=y;labels.forEach((t,i)=>page.drawText(t,{x:left,y:start-i*15,font:strong,size:9,color}));values.forEach((t,i)=>page.drawText(t,{x:left+172,y:start-i*15,font,size:10,color:muted}));y-=height;
   }else{const labelLines=wrap(label,9,strong,width);if(y<bottom+labelLines.length*14+30)newPage();text(label,{size:9,face:strong,tint:color});text(v,{size:10});y-=7;}
  }
  y-=5;
 }
 const pages=doc.getPages();pages.forEach((p,i)=>{p.drawText('Destiny character record  |  '+(i+1)+' / '+pages.length,{x:left,y:30,font,size:8,color:muted});});
 doc.setTitle(model.name+' Character Record');doc.setAuthor('Destiny Player Chronicle');doc.setCreationDate(new Date(model.at));return doc.save();
}
async function word(model,{docx:d}){
 const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,HeadingLevel,PageNumber,Footer,AlignmentType}=d;
 const p=(text,opts={})=>new Paragraph({...opts,children:String(text).split('\n').map((line,i)=>new TextRun({text:line,break:i?1:0}))});
 const children=[p(model.name,{heading:HeadingLevel.TITLE}),p('DESTINY PLAYER CHRONICLE',{spacing:{after:220}})];
 for(const section of model.sections){children.push(p(section.title,{heading:HeadingLevel.HEADING_1,keepNext:true}));
  // Short repeated records use tables. Long prose remains ordinary editable paragraphs.
  if(section.rows.length>=3&&section.rows.every(r=>r.join('').length<220)){
   const cell=(text,head=false)=>new TableCell({verticalAlign:'center',shading:head?{fill:navy}:undefined,margins:{top:80,bottom:80,left:120,right:120},children:[new Paragraph({spacing:{before:0,after:0,line:240},children:[new TextRun({text,color:head?'FFFFFF':'182C3E',bold:head,size:20})]})]});
   children.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},columnWidths:[2800,7280],borders:Object.fromEntries(['top','bottom','left','right','insideHorizontal','insideVertical'].map(k=>[k,{style:'single',size:4,color:'D9D9D9'}])),rows:[new TableRow({tableHeader:true,children:[cell('Detail',true),cell('Value',true)]}),...section.rows.map(([label,v])=>new TableRow({children:[cell(label),cell(v)]}))]}));children.push(p(''));
  }else for(const [label,v]of section.rows){if(!(section.rows.length===1&&label===section.title))children.push(p(label,{heading:HeadingLevel.HEADING_2,keepNext:true}));children.push(p(v,{spacing:{after:160}}));}
 }
 const document=new Document({creator:'Destiny Player Chronicle',title:model.name+' Character Record',styles:{default:{document:{run:{font:'Calibri',size:22,color:'182C3E'},paragraph:{spacing:{after:100,line:276}}}},paragraphStyles:[{id:'Title',name:'Title',basedOn:'Normal',run:{size:44,bold:true,color:'000000'}},{id:'Heading1',name:'Heading 1',basedOn:'Normal',next:'Normal',run:{size:28,bold:true,color:'000000'},paragraph:{spacing:{before:220,after:100},keepNext:true}},{id:'Heading2',name:'Heading 2',basedOn:'Normal',next:'Normal',run:{size:22,bold:true,color:'000000'},paragraph:{spacing:{before:100,after:60},keepNext:true}}]},sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:900,bottom:900,left:1080,right:1080}}},footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({text:'Destiny character record  |  ',size:18}),new TextRun({children:[PageNumber.CURRENT],size:18})]})]})},children}]});
 return new Uint8Array(await Packer.toArrayBuffer(document));
}
return {pdf,word};
});
