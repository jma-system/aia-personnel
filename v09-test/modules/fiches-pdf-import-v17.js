/* AIA Répertoire : un seul importateur PDF, fiche compacte au format FAMILLE.
   Lecture locale, aucun enregistrement tant que la fiche n'a pas été validée. */
(()=>{
'use strict';
const panel=document.getElementById('indexPanel');
const tabs=panel?.querySelector('.aia-index-tabs');
if(!panel||!tabs)return;
document.getElementById('aia-fiches-jwpub-import')?.remove();
document.getElementById('aia-fiches-pdf-import')?.remove();
const css=document.createElement('style');
css.textContent='#aia-fiches-pdf-import{padding:14px;margin:0 0 14px;background:white;border:1px solid #b7ccdf;border-radius:12px;color:#172d44}#aia-fiches-pdf-import h2{font-size:19px;margin:0 0 12px}#aia-fiches-pdf-import label{font-weight:700;font-size:15px}#aia-fiches-pdf-import input{display:block;width:100%;margin:8px 0 13px;padding:12px;background:#fff;border:1px dashed #92abc3;border-radius:9px}#aia-fiches-pdf-import button{background:#17639a;color:#fff;min-height:48px;border:0;padding:10px 13px;border-radius:9px}#aia-pdf-status{font-size:14px;line-height:1.5;margin:12px 0 0}#aia-pdf-modal[hidden],#aia-qr-modal[hidden]{display:none!important}#aia-pdf-modal{position:fixed;inset:0;z-index:2147483000;overflow-y:auto;overscroll-behavior:contain;background:#111;padding:86px 12px 45px}#aia-pdf-modal .aia-x{position:fixed;top:20px;right:16px;z-index:5;width:44px;height:44px;border:2px solid #fff;border-radius:50%;background:#183554;color:#fff;font:700 31px Arial;display:flex;align-items:center;justify-content:center}#aia-pdf-sheet{width:100%;max-width:640px;margin:auto;background:#eaf7ff;border:2px solid #228bd0;border-radius:19px;overflow:hidden;color:#071425;font-family:Verdana,Geneva,sans-serif}#aia-pdf-sheet .aia-top{height:43px;background:#073a79;color:white;display:flex;justify-content:space-between;align-items:center;padding:0 14px;font-family:Verdana,Geneva,sans-serif;font-size:15px}#aia-pdf-sheet .aia-back{border:0;background:transparent;color:#fff;font:32px Arial;min-height:40px;padding:0 8px}#aia-pdf-sheet .aia-body{padding:11px 10px 18px}#aia-pdf-sheet .aia-heading{position:relative;background:#c7e6ff;border-radius:12px;padding:10px 10px 10px 27px;font-family:Verdana,Geneva,sans-serif;font-size:clamp(17px,4.25vw,21px);line-height:1.12;font-weight:bold}#aia-pdf-sheet .aia-heading:before{content:"";position:absolute;left:11px;top:10px;bottom:10px;width:6px;border-radius:5px;background:#00cde7}#aia-pdf-sheet .aia-cols{display:grid;grid-template-columns:minmax(0,.96fr) minmax(0,1.04fr);gap:7px;margin-top:17px;align-items:start}#aia-pdf-sheet .aia-photo{width:100%;aspect-ratio:291/519;overflow:hidden;border-radius:10px;background:#d5ecfb}#aia-pdf-sheet .aia-photo img{width:100%;height:100%;object-fit:cover;object-position:52% center;display:block}#aia-pdf-sheet .aia-verses{display:flex;flex-direction:column;gap:5px;min-width:0}#aia-pdf-sheet .aia-verse{border:1px solid #79bee4;background:#f8fcff;border-radius:10px;padding:7px 9px;font:clamp(11px,2.75vw,13px)/1.14 Verdana,Geneva,sans-serif;min-width:0;overflow-wrap:break-word}#aia-pdf-sheet .aia-verse a{display:block;color:#0661c4;text-decoration:underline;font-weight:bold;font-size:inherit;line-height:1.14;margin-top:2px}#aia-pdf-sheet .aia-replace-image{display:block;margin:10px 0 0;padding:8px 12px;min-height:42px;border:1px solid #67b7e2;border-radius:9px;background:#d9edff;color:#073a79;font:13px Verdana,Geneva,sans-serif}#aia-pdf-sheet .aia-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:17px}#aia-pdf-sheet .aia-actions button{min-height:48px;display:flex;align-items:center;justify-content:center;gap:5px;background:#cce8ff;color:#071425;border:1px solid #67b7e2;border-radius:10px;padding:4px 5px;font:13px Verdana,Geneva,sans-serif}#aia-pdf-sheet .aia-actions .share-icon{width:23px;height:23px;flex:none;margin-right:7px}@media(max-width:420px){#aia-pdf-sheet .aia-actions .share-icon{width:20px;height:20px;margin-right:5px}}#aia-pdf-sheet .aia-actions img{height:42px;width:42px;object-fit:contain}#aia-qr-modal{position:fixed;inset:0;background:#111e;z-index:2147483001;display:flex;align-items:center;justify-content:center}#aia-qr-modal>div{background:#fff;padding:20px;border-radius:12px;text-align:center}#aia-qr-modal img{display:block;width:240px;max-width:75vw;image-rendering:pixelated}#aia-qr-modal button{min-height:44px;margin-top:12px}@media(min-width:520px){#aia-pdf-sheet .aia-body{padding:16px 14px 22px}#aia-pdf-sheet .aia-cols{gap:12px}#aia-pdf-sheet .aia-verse{font-size:15px;line-height:1.18;padding:10px}}@media print{body.aia-pdf-print>*:not(#aia-pdf-modal){display:none!important}body.aia-pdf-print #aia-pdf-modal{display:block!important;position:static!important;padding:0!important;background:white!important;overflow:visible!important}body.aia-pdf-print #aia-pdf-sheet{max-width:100%!important;border-radius:0!important}body.aia-pdf-print #aia-pdf-sheet .aia-top{display:flex!important}body.aia-pdf-print .aia-x,body.aia-pdf-print .aia-actions{display:none!important}@page{margin:12mm}}';

/* Fiche Dieu : typographie de référence FAMILLE, sans modifier Royaume. */
css.textContent += '#aia-pdf-sheet.aia-dieu .aia-heading{font-family:Verdana,Geneva,sans-serif;font-weight:700;letter-spacing:0}#aia-pdf-sheet.aia-dieu .aia-verse{font-family:Verdana,Geneva,sans-serif;font-size:clamp(13px,3.3vw,16px);line-height:1.22;letter-spacing:0;font-weight:400}#aia-pdf-sheet.aia-dieu .aia-verse a{font-family:Verdana,Geneva,sans-serif;font-size:inherit;font-weight:700;letter-spacing:0;line-height:1.2}@media(max-width:420px){#aia-pdf-sheet.aia-dieu .aia-verse{font-size:clamp(12px,3.15vw,14px)}}';
css.textContent += '#aia-pdf-sheet.aia-dieu .aia-verses{align-self:stretch;justify-content:space-between;min-height:0}#aia-pdf-sheet.aia-dieu .aia-cols{align-items:stretch}';
document.head.append(css);
const box=document.createElement('section');
box.id='aia-fiches-pdf-import';
box.innerHTML='<h2>Importer un PDF dans le Répertoire</h2><label for="aia-pdf-file">Choisir le PDF original</label><input id="aia-pdf-file" type="file" accept=".pdf,application/pdf"><button type="button" id="aia-pdf-go">Transformer en fiche</button><p id="aia-pdf-status" role="status">Lecteur PDF 17 — prêt.</p>';
tabs.before(box);
/* Correction de contraste indépendante des feuilles CSS et du cache de palette.
   Le panneau est blanc en modes clair et nuit : conserver une encre foncée.
   Styles inline !important pour éviter l'écrasement par les thèmes globaux. */
const importHeading=box.querySelector('h2');
importHeading.style.setProperty('color','#17385c','important');
importHeading.style.setProperty('-webkit-text-fill-color','#17385c','important');
importHeading.style.setProperty('opacity','1','important');
box.style.setProperty('background-color','#ffffff','important');
box.style.setProperty('color','#172d44','important');
box.style.setProperty('color-scheme','light','important');
const fileInput=box.querySelector('#aia-pdf-file');
fileInput.style.setProperty('background-color','#ffffff','important');
fileInput.style.setProperty('color','#172d44','important');
fileInput.style.setProperty('-webkit-text-fill-color','#172d44','important');
fileInput.style.setProperty('color-scheme','light','important');
const input=box.querySelector('#aia-pdf-file'),btn=box.querySelector('#aia-pdf-go'),status=box.querySelector('#aia-pdf-status');
function say(msg,err=false){status.textContent=msg;status.style.color=err?'#aa2525':'#166b42'}
const viewer=document.createElement('div');viewer.id='aia-pdf-modal';viewer.hidden=true;viewer.setAttribute('role','dialog');viewer.setAttribute('aria-modal','true');

const sheet=document.createElement('article');sheet.id='aia-pdf-sheet';viewer.append(sheet);document.body.append(viewer);
const qrModal=document.createElement('div');qrModal.id='aia-qr-modal';qrModal.hidden=true;document.body.append(qrModal);
function close(){viewer.hidden=true;qrModal.hidden=true;document.body.style.overflow='';document.body.classList.remove('aia-pdf-print')}
viewer.onclick=e=>{if(e.target===viewer)close()};document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!viewer.hidden)close()});
function element(tag,cls,txt){const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el}
async function pdfLib(){if(window.pdfjsLib)return window.pdfjsLib;await new Promise((yes,no)=>{const js=document.createElement('script');js.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';js.onload=yes;js.onerror=()=>no(Error('Impossible de charger PDF.js. Vérifie la connexion Internet.'));document.head.append(js)});return window.pdfjsLib}
async function renderPage(page,scale){const v=page.getViewport({scale});const canvas=document.createElement('canvas');canvas.width=Math.ceil(v.width);canvas.height=Math.ceil(v.height);await page.render({canvasContext:canvas.getContext('2d'),viewport:v}).promise;return canvas}
function crop(canvas,x,y,w,h,outSize=360){const dst=document.createElement('canvas');dst.width=outSize;dst.height=Math.max(1,Math.round(outSize*h/w));dst.getContext('2d').drawImage(canvas,x,y,w,h,0,0,dst.width,dst.height);return dst.toDataURL('image/png')}
function normalize(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'')}
function ref(title,book,chapter,verse){
const books={19:'Psaumes',23:'Isa%C3%AFe',66:'R%C3%A9v%C3%A9lation',24:'J%C3%A9r%C3%A9mie',55:'2-timoth%C3%A9e'};
const link=element('a','',title);link.href='https://www.jw.org/fr/biblioth%C3%A8que/bible/nwt/livres/'+books[book]+'/'+chapter+'/#v'+String(book).padStart(2,'0')+String(chapter).padStart(3,'0')+String(verse).padStart(3,'0');link.target='_blank';link.rel='noopener noreferrer';return link;
}
function passage(parent,txt,refs){const card=element('div','aia-verse',txt);refs.forEach(r=>card.append(ref(...r)));parent.append(card)}
function qrLarge(src){qrModal.replaceChildren();const wrap=element('div');const img=document.createElement('img');img.src=src;img.alt='Code QR original du tract';const done=element('button','','Fermer');done.onclick=()=>{qrModal.hidden=true};wrap.append(img,done);qrModal.append(wrap);qrModal.hidden=false}
async function share(pdfFile){if(navigator.share&&navigator.canShare?.({files:[pdfFile]})){try{await navigator.share({title:'Peut-on vivre pour toujours ?',files:[pdfFile]})}catch(e){if(e.name!=='AbortError')say('Le partage du PDF a échoué.',true)}}else say('Partage direct indisponible : utilise le PDF original depuis tes fichiers.',true)}
let selectedImageUrl=null;
function chooseReplacement(image){
 const picker=document.createElement('input');
 picker.type='file';picker.accept='image/*';picker.hidden=true;
 document.body.append(picker);
 picker.addEventListener('change',()=>{
  const f=picker.files?.[0];picker.remove();
  if(!f)return;
  if(!f.type.startsWith('image/'))return say('Choisis une image de ta galerie.',true);
  const url=URL.createObjectURL(f);
  image.onload=()=>{if(selectedImageUrl)URL.revokeObjectURL(selectedImageUrl);selectedImageUrl=url;};
  image.onerror=()=>{URL.revokeObjectURL(url);say('Cette image ne peut pas être affichée.',true)};
  image.src=url;
  image.alt='Illustration choisie dans la galerie';
 },{once:true});
 picker.click();
 setTimeout(()=>picker.remove(),120000);
}

/* Extraction contrôlée de tracts PDF en deux pages, sans texte pré-rédigé. */
function extractZone(items,page,from,to){
 const h=page.view[3];
 return items.filter(it=>it.str&&it.transform&&h-it.transform[5]>=from&&h-it.transform[5]<=to)
  .sort((a,b)=>(b.transform[5]-a.transform[5])||(a.transform[4]-b.transform[4]))
  .map(it=>it.str).join(' ').replace(/\s+/g,' ').trim();
}
function parsedReferences(raw){
 const bookMap={
  'p':{id:19,slug:'psaumes'},'psaume':{id:19,slug:'psaumes'},'psaumes':{id:19,slug:'psaumes'},
  'daniel':{id:27,slug:'daniel'},'da':{id:27,slug:'daniel'},
  'isaie':{id:23,slug:'isaie'},'is':{id:23,slug:'isaie'},
  'jeremie':{id:24,slug:'jeremie'},'jr':{id:24,slug:'jeremie'},
  'matthieu':{id:40,slug:'matthieu'},'mt':{id:40,slug:'matthieu'},
  'luc':{id:42,slug:'luc'},'lc':{id:42,slug:'luc'},
  'jean':{id:43,slug:'jean'},'jn':{id:43,slug:'jean'},
  'revelation':{id:66,slug:'revelation'},'rv':{id:66,slug:'revelation'},
  'proverbes':{id:20,slug:'proverbes'},'pr':{id:20,slug:'proverbes'},
  '2 timothee':{id:55,slug:'2-timothee'},'2 tm':{id:55,slug:'2-timothee'}
 };
 const source=raw.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[‐‑–—]/g,'-');
 let last=null;
 const parts=source.split(/\s*;\s*/);
 const result=[];
 for(let part of parts){
  const found=part.match(/(2\s*timothee|2\s*tm|psaumes?|daniel|da|isaie|is|jeremie|jr|matthieu|mt|luc|lc|jean|jn|revelation|rv|proverbes|pr|p)\s+(\d{1,3})\s*:\s*(\d{1,3})/i);
  let chapter,verse;
  if(found){
   const key=found[1].toLowerCase().replace(/\s+/g,' ');
   last=bookMap[key];chapter=Number(found[2]);verse=Number(found[3]);
  }else{
   const noBook=part.match(/(\d{1,3})\s*:\s*(\d{1,3})/);
   if(!last||!noBook)continue;
   chapter=Number(noBook[1]);verse=Number(noBook[2]);
  }
  if(!last||chapter<1||verse<1||chapter>150||verse>176)continue;
  const label=part.trim().replace(/^\(+|\)+$/g,'').trim();
  result.push({label,book:last.id,slug:last.slug,chapter,verse});
 }
 return result;
}
function extractTract(p1,p2,items1,items2){
 // Page 1 : positionner le titre et la citation d'après le contenu PDF réel.
 // Le tract officiel Royaume place le titre vers y=140–178 et la citation vers y=210–240.
 const title=extractZone(items1,p1,120,207).replace(/\s+/g,' ').trim();
 const lead=extractZone(items1,p1,202,255);
 // Certaines couches texte PDF n'emploient ni guillemets français ni parenthèses.
 // N'accepter un repli que si une citation et une référence sont réellement présentes.
 const quoteMatch=lead.match(/«[^»]+»|“[^”]+”|"[^"]+"/);
 const referenceMatch=lead.match(/\(([^)]*\d+\s*:\s*\d+[^)]*)\)/)
  ||lead.match(/((?:2\s*Timoth[eé]e|Psaumes?|Isa[iï]e|J[eé]r[eé]mie|Daniel|Matthieu|Jean|Luc|R[eé]v[eé]lation|Proverbes)\s+\d{1,3}\s*:\s*\d{1,3}(?:\s*[-,]\s*\d{1,3})?)/i);
 const leadRef=referenceMatch?.[1]||'';
 const leadQuote=quoteMatch?.[0]||'';
 if(!title||title.length<8||title.length>180)throw Error('Titre non reconnu sur la première page : vérifie le PDF original.');
 if(!leadQuote)throw Error('Citation d’ouverture non reconnue : guillemets ou texte PDF absents.');
 if(!leadRef)throw Error('Référence biblique d’ouverture non reconnue : vérifie le PDF original.');
 const opening={text:leadQuote.replace(/\[\s*5\s*\]/g,'[…]'),citation:leadRef,refs:parsedReferences(leadRef)};
 const second=extractZone(items2,p2,15,212);
 let bullets=second.split(/[˙•●]/u).slice(1).map(x=>x.trim()).filter(Boolean);
 if(!bullets.length){
  // Certaines polices PDF emploient un point typographique représenté différemment.
  bullets=second.split(/(?:\s{2,}|^)[•·]\s*/).slice(1).map(x=>x.trim()).filter(Boolean);
 }
 if(!bullets.length)throw Error('Liste de la seconde page non reconnue : aucune fiche automatique créée.');
 const entries=[opening];
 for(const bullet of bullets.slice(0,5)){
  const matches=[...bullet.matchAll(/\(([^)]*\d+\s*:\s*\d+[^)]*)\)/g)];
  if(!matches.length)continue;
  const citation=matches.map(m=>m[1]).join(' ; ');
  const firstAt=matches[0].index;
  const description=bullet.slice(0,firstAt).replace(/[. ;:,]+$/,'').trim();
  if(!description)continue;
  entries.push({text:description+'.',citation,refs:parsedReferences(citation)});
 }
 if(entries.length<3)throw Error('Le tract ne contient pas assez de passages exploitables : vérification nécessaire.');
 // Conserver les citations imprimées même lorsqu'un livre n'est pas encore reconnu.
 // Aucun lien n'est fabriqué pour une référence incertaine.
 for(const entry of entries){
  if(!entry.refs.length)entry.unverified=true;
 }
 return {title,entries};
}
function passageExtracted(parent,entry){
 const card=element('div','aia-verse',entry.text);
 for(const r of entry.refs){
  const a=element('a','',r.label);
  a.href='https://www.jw.org/fr/biblioth%C3%A8que/bible/nwt/livres/'+r.slug+'/'+r.chapter+'/#v'+String(r.book).padStart(2,'0')+String(r.chapter).padStart(3,'0')+String(r.verse).padStart(3,'0');
  a.target='_blank';a.rel='noopener noreferrer';card.append(a);
 }
 if(entry.unverified){
  const note=element('span','aia-ref-warning','Référence à vérifier : '+entry.citation);
  note.style.cssText='display:block;color:#9b4c00;font-size:11px;margin-top:3px';
  card.append(note);
 }
 parent.append(card);
}

// Export a standalone, recoverable PNG before adding the fiche to IndexedDB.
function imageReady(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Illustration ou QR illisible'));img.src=src})}
function wrapCanvas(ctx,text,x,y,maxWidth,lineHeight){
 const words=String(text).split(/\\s+/);let line='';
 for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){ctx.fillText(line,x,y);y+=lineHeight;line=word}else line=test}
 if(line){ctx.fillText(line,x,y);y+=lineHeight}return y;
}
async function renderFichePng(title,entries,photoSrc,qrSrc){
 const [photo,qr]=await Promise.all([imageReady(photoSrc),imageReady(qrSrc)]);
 const canvas=document.createElement('canvas');canvas.width=960;canvas.height=1320;
 const c=canvas.getContext('2d');c.fillStyle='#eaf7ff';c.fillRect(0,0,960,1320);
 c.fillStyle='#073a79';c.fillRect(0,0,960,100);c.fillStyle='white';c.font='34px Verdana';c.fillText('AIA — Fiche illustrée',40,62);
 c.fillStyle='#c7e6ff';c.fillRect(28,130,904,145);c.fillStyle='#071425';c.font='bold 34px Verdana';wrapCanvas(c,title,64,182,825,45);
 const photoX=30,photoY=315,photoW=410,photoH=735;
 c.save();c.beginPath();c.rect(photoX,photoY,photoW,photoH);c.clip();const scale=Math.max(photoW/photo.width,photoH/photo.height);c.drawImage(photo,photoX+(photoW-photo.width*scale)/2,photoY+(photoH-photo.height*scale)/2,photo.width*scale,photo.height*scale);c.restore();
 let y=315;
 for(const entry of entries){
  c.font='27px Verdana';const lines=Math.max(2,Math.ceil(c.measureText(entry.text).width/440));const h=Math.max(130,Math.min(255,lines*39+76));
  c.fillStyle='#f7fcff';c.fillRect(465,y,465,h);c.strokeStyle='#83bdd8';c.lineWidth=2;c.strokeRect(465,y,465,h);
  c.fillStyle='#071425';let ty=wrapCanvas(c,entry.text,485,y+39,425,36);
  c.fillStyle='#1467b2';c.font='bold 24px Verdana';wrapCanvas(c,entry.citation||'',485,Math.min(ty+8,y+h-25),420,30);
  y+=h+13;
  if(y>1060)break;
 }
 c.fillStyle='#d3eaff';c.fillRect(30,1110,900,165);c.drawImage(qr,50,1120,145,145);
 c.fillStyle='#071425';c.font='26px Verdana';c.fillText('Fiche AIA — copie de sauvegarde',220,1200);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Export PNG impossible')),'image/png'));
}
function downloadBackup(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='AIA-'+name.replace(/[^a-z0-9-]+/gi,'-').slice(0,60)+'.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
function build(photo,qr,pdfFile,kind='avenir',extracted=null){
const god=kind==='dieu';
sheet.classList.toggle('aia-dieu',god);
sheet.replaceChildren();
const bar=element('header','aia-top');const back=element('button','aia-back','‹');back.onclick=close;back.setAttribute('aria-label','Retour au Répertoire');const title=element('span','',extracted?'Tract – '+extracted.title:(god?'Tract – Dieu':'Tract – L’avenir'));title.style.cssText='min-width:0;max-width:70%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;text-align:center';
const signet=element('span');signet.innerHTML='<svg width="24" height="28" viewBox="0 0 24 28" fill="none" aria-label="Signet bientôt disponible"><path d="M4 2.5H20V25L12 19.5L4 25V2.5Z" stroke="white" stroke-width="2.5" stroke-linejoin="round"/></svg>';
bar.append(back,title,signet);
const body=element('section','aia-body');
body.append(element('div','aia-heading',extracted?extracted.title:(god?'Qui est le vrai Dieu ?':'Peut-on vivre pour toujours ?')));
const cols=element('div','aia-cols'),pic=element('div','aia-photo'),im=document.createElement('img');im.src=photo;im.alt=god?'Illustration originale du tract : un homme en chemise bleue':'Illustration : un homme en montagne avec un ourson et sa mère';pic.append(im);
const verses=element('div','aia-verses');
if(extracted){for(const entry of extracted.entries)passageExtracted(verses,entry);
}else if(god){
passage(verses,'« Jéhovah est réellement Dieu. Il est le Dieu vivant »',[['Jérémie 10:10',24,10,10]]);
passage(verses,'Dieu a un nom.',[['Psaume 83:18',19,83,18]]);
passage(verses,'Il communique avec les humains.',[['2 Timothée 3:16, 17',55,3,16]]);
passage(verses,'Il veut nous aider.',[['Psaume 145:18, 19',19,145,18]]);
}else{
passage(verses,'« Les justes posséderont la terre et ils y vivront éternellement »',[['Psaume 37:29',19,37,29]]);
passage(verses,'Tout le monde sera en parfaite santé.',[['Isaïe 33:24',23,33,24],['Isaïe 35:5, 6',23,35,5]]);
passage(verses,'Les dégâts faits à l’environnement seront réparés.',[['Isaïe 35:1, 2',23,35,1],['Révélation 11:18',66,11,18]]);
}cols.append(pic,verses);body.append(cols);
const replace=element('button','aia-replace-image','Remplacer l’image');
replace.type='button';replace.onclick=()=>chooseReplacement(im);
body.append(replace);
const acts=element('div','aia-actions'),qrBtn=element('button'),qrImg=document.createElement('img');qrImg.src=qr;qrImg.alt='QR code';qrBtn.title='Agrandir le QR original';qrBtn.append(qrImg);qrBtn.onclick=()=>qrLarge(qr);
const pdfBtn=element('button','','↓ PDF');pdfBtn.onclick=()=>{document.body.classList.add('aia-pdf-print');window.addEventListener('afterprint',()=>document.body.classList.remove('aia-pdf-print'),{once:true});window.print()};
const shareBtn=element('button');shareBtn.setAttribute('aria-label','Partager');shareBtn.innerHTML='<svg class="share-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.5 6.6-4M8.7 13.5l6.6 4"/></svg><span>Partager</span>';shareBtn.onclick=()=>share(pdfFile);
const saveBtn=element('button','','Enregistrer dans AIA');saveBtn.type='button';
saveBtn.onclick=async()=>{
 if(!extracted){say('Enregistrement pilote réservé aux fiches extraites du PDF.',true);return}
 const theme=prompt('Classement THÈMES : L’avenir, La famille, Dieu, La prière, Jésus, Le Royaume de Dieu, Les souffrances, La mort, La religion ou Actualité',extracted.title.toLowerCase().includes('royaume')?'Le Royaume de Dieu':'');
 if(theme===null)return;
 saveBtn.disabled=true;
 try{
  const blob=await renderFichePng(extracted.title,extracted.entries,im.src,qr);
  downloadBackup(blob,extracted.title);
  const requestId=crypto.randomUUID();
  const result=await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>{cleanup();reject(Error('Enregistrement non confirmé'))},12000);
   function cleanup(){clearTimeout(timeout);window.removeEventListener('aia:pdf-fiche-saved',ok);window.removeEventListener('aia:pdf-fiche-save-failed',fail)}
   function ok(e){if(e.detail?.requestId!==requestId)return;cleanup();resolve(e.detail)}
   function fail(e){if(e.detail?.requestId!==requestId)return;cleanup();reject(Error(e.detail?.message||'Stockage indisponible'))}
   window.addEventListener('aia:pdf-fiche-saved',ok);window.addEventListener('aia:pdf-fiche-save-failed',fail);
   const references=extracted.entries.flatMap(entry=>(entry.refs||[]).map(ref=>({reference:ref.label||entry.citation||'',book:ref.book,slug:ref.slug,chapter:ref.chapter,verse:ref.verse}))).filter(ref=>ref.book&&ref.chapter&&ref.verse);
   window.dispatchEvent(new CustomEvent('aia:save-pdf-fiche',{detail:{requestId,blob,topic:theme,label:extracted.title,references}}));
  });
  say('Fiche enregistrée dans THÈMES / '+theme+'. Copie PNG téléchargée.');
  saveBtn.textContent='Enregistré dans AIA';
 }catch(error){say('Enregistrement impossible : '+error.message,true);saveBtn.disabled=false}
};
body.append(saveBtn);
acts.append(qrBtn,pdfBtn,shareBtn);body.append(acts);sheet.append(bar,body);viewer.hidden=false;viewer.scrollTop=0;document.body.style.overflow='hidden';
}
btn.addEventListener('click',async()=>{
if(!input.files?.length)return say('Choisis un PDF.',true);
const f=input.files[0];if(!(/\.pdf$/i.test(f.name)||f.type==='application/pdf'))return say('Choisis un fichier PDF.',true);
btn.disabled=true;say('Extraction de la photo et des références en cours…');
let pdf;
try{
 const lib=await pdfLib();lib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
 pdf=await lib.getDocument({data:new Uint8Array(await f.arrayBuffer())}).promise;
 if(pdf.numPages<2)throw Error('Le modèle pilote attend les deux pages du tract.');
 const p1=await pdf.getPage(1),p2=await pdf.getPage(2);
 const t1=(await p1.getTextContent()).items.map(x=>x.str).join(' ');
 const t2=(await p2.getTextContent()).items.map(x=>x.str).join(' ');
 const txt=normalize(t1+t2);
 const isGod=txt.includes('quiestlevraidieu')&&txt.includes('jeremie1010')&&txt.includes('psaume8318')&&txt.includes('timothee31617')&&txt.includes('psaume1451819');
 const isAvenir=txt.includes('pourtoujours')&&txt.includes('3729')&&(txt.includes('3324')||txt.includes('1118'));
 // Tout tract à deux pages de la même structure utilise désormais l'extraction de son contenu,
 // sans ajout de son nom dans une liste. Les deux pilotes historiques sont préservés.
 // Extraire le texte réel des deux pages, sans réponse codée selon le nom du fichier.
 let extracted=(!isGod&&!isAvenir)?extractTract(p1,p2,(await p1.getTextContent()).items,(await p2.getTextContent()).items):null;
 const officialFilename=/^T[-_]ftr[-_]F[.]pdf$/i.test(f.name);const officialText=txt.includes('pourtoujours')&&txt.includes('3729');const sourceEvidence=txt.length>120&&(txt.includes('3324')||txt.includes('1118'));if(!extracted&&!isGod&&(!sourceEvidence||!(officialFilename||officialText)))throw Error('Document non reconnu : vérifie que tu as choisi le PDF « Qui est le vrai Dieu ? » ou « Peut-on vivre pour toujours ? ».');
 const c2=await renderPage(p2,3);
 
 const c1=(isGod||extracted)?await renderPage(p1,3):null;
const photo=extracted?crop(c1,c1.width*.04,0,c1.width*.92,c1.height*.44,500):isGod?crop(c1,c1.width*.04,c1.height*.015,c1.width*.92,c1.height*.40,500):'./fiches/avenir-ours.svg?v=1';
 const qr=crop(c2,c2.width*(156/233.86),c2.height*(238/306.14),c2.width*(55/233.86),c2.height*(59/306.14),360);
 build(photo,qr,f,isGod?'dieu':'avenir',extracted);
 say('Fiche provisoire depuis le PDF original : vérifie les textes, les liens, l’image et le QR. Aucun enregistrement automatique.');
}catch(e){say('Conversion impossible : '+e.message,true)}
finally{try{await pdf?.destroy()}catch(e){}btn.disabled=false}
});
})();