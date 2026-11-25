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
css.textContent='#aia-fiches-pdf-import{padding:14px;margin:0 0 14px;background:white;border:1px solid #b7ccdf;border-radius:12px;color:#172d44}#aia-fiches-pdf-import h2{font-size:19px;margin:0 0 12px}#aia-fiches-pdf-import label{font-weight:700;font-size:15px}#aia-fiches-pdf-import input{display:block;width:100%;margin:8px 0 13px;padding:12px;background:#fff;border:1px dashed #92abc3;border-radius:9px}#aia-fiches-pdf-import button{background:#17639a;color:#fff;min-height:48px;border:0;padding:10px 13px;border-radius:9px}#aia-pdf-status{font-size:14px;line-height:1.5;margin:12px 0 0}#aia-pdf-modal[hidden],#aia-qr-modal[hidden]{display:none!important}#aia-pdf-modal{position:fixed;inset:0;z-index:2147483000;overflow-y:auto;overscroll-behavior:contain;background:#111;padding:86px 12px 45px}#aia-pdf-modal .aia-x{position:fixed;top:20px;right:16px;z-index:5;width:44px;height:44px;border:2px solid #fff;border-radius:50%;background:#183554;color:#fff;font:700 31px Arial;display:flex;align-items:center;justify-content:center}#aia-pdf-sheet{width:100%;max-width:640px;margin:auto;background:#e8f6ff;border-radius:19px;overflow:hidden;color:#071425;font-family:Verdana,Geneva,sans-serif}#aia-pdf-sheet .aia-top{height:43px;background:#073a79;color:white;display:flex;justify-content:space-between;align-items:center;padding:0 14px;font-size:15px}#aia-pdf-sheet .aia-back{border:0;background:transparent;color:#fff;font:32px Arial;min-height:40px;padding:0 8px}#aia-pdf-sheet .aia-body{padding:11px 10px 18px}#aia-pdf-sheet .aia-heading{position:relative;background:#cce9ff;border-radius:12px;padding:10px 10px 10px 27px;font-size:clamp(17px,4.3vw,25px);line-height:1.15;font-weight:bold}#aia-pdf-sheet .aia-heading:before{content:"";position:absolute;left:11px;top:10px;bottom:10px;width:6px;border-radius:5px;background:#00cde7}#aia-pdf-sheet .aia-cols{display:grid;grid-template-columns:minmax(0,.96fr) minmax(0,1.04fr);gap:7px;margin-top:17px;align-items:start}#aia-pdf-sheet .aia-photo{width:100%;aspect-ratio:291/519;overflow:hidden;border-radius:10px;background:#d5ecfb}#aia-pdf-sheet .aia-photo img{width:100%;height:100%;object-fit:cover;object-position:52% center;display:block}#aia-pdf-sheet .aia-verses{display:flex;flex-direction:column;gap:5px;min-width:0}#aia-pdf-sheet .aia-verse{border:1px solid #9cd6ef;background:#e9f6ff;border-radius:10px;padding:7px 9px;font:12px/1.2 Verdana,Geneva,sans-serif;min-width:0;overflow-wrap:break-word}#aia-pdf-sheet .aia-verse a{display:block;color:#0661c4;text-decoration:underline;font-weight:bold;line-height:1.16;margin-top:1px}#aia-pdf-sheet .aia-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:17px}#aia-pdf-sheet .aia-actions button{min-height:48px;display:flex;align-items:center;justify-content:center;gap:5px;background:#d9edff;color:#071425;border:1px solid #67b7e2;border-radius:10px;padding:4px 5px;font:13px Verdana,Geneva,sans-serif}#aia-pdf-sheet .aia-actions img{height:42px;width:42px;object-fit:contain}#aia-qr-modal{position:fixed;inset:0;background:#111e;z-index:2147483001;display:flex;align-items:center;justify-content:center}#aia-qr-modal>div{background:#fff;padding:20px;border-radius:12px;text-align:center}#aia-qr-modal img{display:block;width:240px;max-width:75vw;image-rendering:pixelated}#aia-qr-modal button{min-height:44px;margin-top:12px}@media(min-width:520px){#aia-pdf-sheet .aia-body{padding:16px 14px 22px}#aia-pdf-sheet .aia-cols{gap:12px}#aia-pdf-sheet .aia-verse{font-size:15px;line-height:1.35;padding:12px}}@media print{body.aia-pdf-print>*:not(#aia-pdf-modal){display:none!important}body.aia-pdf-print #aia-pdf-modal{display:block!important;position:static!important;padding:0!important;background:white!important;overflow:visible!important}body.aia-pdf-print #aia-pdf-sheet{max-width:100%!important;border-radius:0!important}body.aia-pdf-print #aia-pdf-sheet .aia-top{display:flex!important}body.aia-pdf-print .aia-x,body.aia-pdf-print .aia-actions{display:none!important}@page{margin:12mm}}';
document.head.append(css);
const box=document.createElement('section');
box.id='aia-fiches-pdf-import';
box.innerHTML='<h2>Importer un PDF dans le Répertoire</h2><label for="aia-pdf-file">Choisir le PDF original</label><input id="aia-pdf-file" type="file" accept=".pdf,application/pdf"><button type="button" id="aia-pdf-go">Transformer en fiche FAMILLE</button><p id="aia-pdf-status" role="status">Prêt pour l’importation.</p>';
tabs.before(box);
const input=box.querySelector('#aia-pdf-file'),btn=box.querySelector('#aia-pdf-go'),status=box.querySelector('#aia-pdf-status');
function say(msg,err=false){status.textContent=msg;status.style.color=err?'#aa2525':'#166b42'}
const viewer=document.createElement('div');viewer.id='aia-pdf-modal';viewer.hidden=true;viewer.setAttribute('role','dialog');viewer.setAttribute('aria-modal','true');
const x=document.createElement('button');x.className='aia-x';x.textContent='×';x.setAttribute('aria-label','Fermer');
const sheet=document.createElement('article');sheet.id='aia-pdf-sheet';viewer.append(x,sheet);document.body.append(viewer);
const qrModal=document.createElement('div');qrModal.id='aia-qr-modal';qrModal.hidden=true;document.body.append(qrModal);
function close(){viewer.hidden=true;qrModal.hidden=true;document.body.style.overflow='';document.body.classList.remove('aia-pdf-print')}
x.onclick=close;viewer.onclick=e=>{if(e.target===viewer)close()};document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!viewer.hidden)close()});
function element(tag,cls,txt){const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el}
async function pdfLib(){if(window.pdfjsLib)return window.pdfjsLib;await new Promise((yes,no)=>{const js=document.createElement('script');js.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';js.onload=yes;js.onerror=()=>no(Error('Impossible de charger PDF.js. Vérifie la connexion Internet.'));document.head.append(js)});return window.pdfjsLib}
async function renderPage(page,scale){const v=page.getViewport({scale});const canvas=document.createElement('canvas');canvas.width=Math.ceil(v.width);canvas.height=Math.ceil(v.height);await page.render({canvasContext:canvas.getContext('2d'),viewport:v}).promise;return canvas}
function crop(canvas,x,y,w,h,outSize=360){const dst=document.createElement('canvas');dst.width=outSize;dst.height=Math.max(1,Math.round(outSize*h/w));dst.getContext('2d').drawImage(canvas,x,y,w,h,0,0,dst.width,dst.height);return dst.toDataURL('image/png')}
function normalize(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'')}
function ref(title,book,chapter,verse){
const books={19:'Psaumes',23:'Isa%C3%AFe',66:'R%C3%A9v%C3%A9lation'};
const link=element('a','',title);link.href='https://www.jw.org/fr/biblioth%C3%A8que/bible/nwt/livres/'+books[book]+'/'+chapter+'/#v'+String(book).padStart(2,'0')+String(chapter).padStart(3,'0')+String(verse).padStart(3,'0');link.target='_blank';link.rel='noopener noreferrer';return link;
}
function passage(parent,txt,refs){const card=element('div','aia-verse',txt);refs.forEach(r=>card.append(ref(...r)));parent.append(card)}
function qrLarge(src){qrModal.replaceChildren();const wrap=element('div');const img=document.createElement('img');img.src=src;img.alt='Code QR original du tract';const done=element('button','','Fermer');done.onclick=()=>{qrModal.hidden=true};wrap.append(img,done);qrModal.append(wrap);qrModal.hidden=false}
async function share(pdfFile){if(navigator.share&&navigator.canShare?.({files:[pdfFile]})){try{await navigator.share({title:'Peut-on vivre pour toujours ?',files:[pdfFile]})}catch(e){if(e.name!=='AbortError')say('Le partage du PDF a échoué.',true)}}else say('Partage direct indisponible : utilise le PDF original depuis tes fichiers.',true)}
function build(photo,qr,pdfFile){
sheet.replaceChildren();
const bar=element('header','aia-top');const back=element('button','aia-back','‹');back.onclick=close;back.setAttribute('aria-label','Retour au Répertoire');const title=element('span','','Tract – L’avenir');
const signet=element('span');signet.innerHTML='<svg width="24" height="28" viewBox="0 0 24 28" fill="none" aria-label="Signet bientôt disponible"><path d="M4 2.5H20V25L12 19.5L4 25V2.5Z" stroke="white" stroke-width="2.5" stroke-linejoin="round"/></svg>';
bar.append(back,title,signet);
const body=element('section','aia-body');
body.append(element('div','aia-heading','Peut-on vivre pour toujours ?'));
const cols=element('div','aia-cols'),pic=element('div','aia-photo'),im=document.createElement('img');im.src=photo;im.alt='Illustration : un homme en montagne avec un ourson et sa mère';pic.append(im);
const verses=element('div','aia-verses');
passage(verses,'« Les justes posséderont la terre et ils y vivront éternellement »',[['Psaume 37:29',19,37,29]]);
passage(verses,'Tout le monde sera en parfaite santé.',[['Isaïe 33:24',23,33,24],['Isaïe 35:5, 6',23,35,5]]);
passage(verses,'Les dégâts faits à l’environnement seront réparés.',[['Isaïe 35:1, 2',23,35,1],['Révélation 11:18',66,11,18]]);
cols.append(pic,verses);body.append(cols);
const acts=element('div','aia-actions'),qrBtn=element('button'),qrImg=document.createElement('img');qrImg.src=qr;qrImg.alt='QR code';qrBtn.title='Agrandir le QR original';qrBtn.append(qrImg);qrBtn.onclick=()=>qrLarge(qr);
const pdfBtn=element('button','','↓ PDF');pdfBtn.onclick=()=>{document.body.classList.add('aia-pdf-print');window.addEventListener('afterprint',()=>document.body.classList.remove('aia-pdf-print'),{once:true});window.print()};
const shareBtn=element('button','','♧ Partager');shareBtn.onclick=()=>share(pdfFile);
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
 const officialFilename=/^T[-_]ftr[-_]F[.]pdf$/i.test(f.name);const officialText=txt.includes('pourtoujours')&&txt.includes('3729');const sourceEvidence=txt.length>120&&(txt.includes('3324')||txt.includes('1118'));if(!sourceEvidence||!(officialFilename||officialText))throw Error('Ce PDF ne correspond pas au tract pilote vérifié. Aucun texte n’est inventé.');
 const c2=await renderPage(p2,3);
 
 const photo='./fiches/avenir-ours.svg?v=1';
 const qr=crop(c2,c2.width*(156/233.86),c2.height*(238/306.14),c2.width*(55/233.86),c2.height*(59/306.14),360);
 build(photo,qr,f);
 say('Fiche préparée depuis le PDF original : vérifie l’image, le QR et les cinq liens bibliques.');
}catch(e){say('Conversion impossible : '+e.message,true)}
finally{try{await pdf?.destroy()}catch(e){}btn.disabled=false}
});
})();