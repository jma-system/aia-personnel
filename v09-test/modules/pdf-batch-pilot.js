/* AIA — lecture groupée expérimentale, sans écriture de stockage. */
(()=>{
'use strict';
const input=document.getElementById('files'),button=document.getElementById('analyze');
const status=document.getElementById('status'),results=document.getElementById('results');
const MAX_FILES=10,MAX_SIZE=20*1024*1024,MAX_PAGES=30;
let busy=false;
function say(message){status.textContent=message}
function loadPdfjs(){
 if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);
 return new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  script.onload=()=>window.pdfjsLib?resolve(window.pdfjsLib):reject(Error('Bibliothèque PDF indisponible'));
  script.onerror=()=>reject(Error('Chargement PDF.js impossible (connexion requise)'));
  document.head.append(script);
 });
}
function item(name){
 const wrap=document.createElement('article');wrap.className='result';
 const title=document.createElement('h2');title.textContent=name;
 const message=document.createElement('p');message.textContent='Contrôle en cours…';
 wrap.append(title,message);results.append(wrap);
 return {wrap,message};
}
async function checkPdf(file,lib,ui){
 if(!(/\.pdf$/i.test(file.name)||file.type==='application/pdf'))throw Error('Fichier non PDF');
 if(file.size===0)throw Error('Fichier vide');
 if(file.size>MAX_SIZE)throw Error('Limite de 20 Mo par PDF dépassée');
 const bytes=new Uint8Array(await file.arrayBuffer());
 if(bytes.length<5||String.fromCharCode(...bytes.slice(0,5))!=='%PDF-')throw Error('Signature PDF absente');
 let pdf;
 try{
  pdf=await lib.getDocument({data:bytes}).promise;
  if(pdf.numPages>MAX_PAGES)throw Error('Plus de 30 pages : contrôle manuel requis');
  const first=await pdf.getPage(1);
  const viewport=first.getViewport({scale:1});
  const scale=Math.min(1.3,Math.max(0.35,Math.min(window.innerWidth-65,650)/viewport.width));
  const rendered=first.getViewport({scale});
  const dpr=Math.min(window.devicePixelRatio||1,2);
  const canvas=document.createElement('canvas');
  canvas.width=Math.ceil(rendered.width*dpr);canvas.height=Math.ceil(rendered.height*dpr);
  canvas.style.width=rendered.width+'px';canvas.style.height=rendered.height+'px';
  await first.render({canvasContext:canvas.getContext('2d'),viewport:first.getViewport({scale:scale*dpr})}).promise;
  ui.wrap.append(canvas);
  ui.message.textContent='PDF lisible — '+pdf.numPages+' page(s). Aperçu de la première page seulement.';
 }finally{if(pdf)try{await pdf.destroy()}catch(_){}}
}
button.addEventListener('click',async()=>{
 if(busy)return;
 const files=Array.from(input.files||[]);
 if(!files.length){say('Sélectionne au moins un PDF.');return}
 if(files.length>MAX_FILES){say('Maximum 10 PDF à la fois pour ce pilote.');return}
 busy=true;button.disabled=true;results.replaceChildren();say('Contrôle individuel de '+files.length+' document(s)…');
 let ok=0,failed=0;
 try{
  let lib;
  try{
   lib=await loadPdfjs();
   lib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }catch(error){say(error.message);return}
  for(const file of files){
   const ui=item(file.name);
   try{await checkPdf(file,lib,ui);ok++}
   catch(error){ui.message.className='error';ui.message.textContent='À vérifier — '+(error.message||'erreur PDF');failed++}
  }
  say(ok+' PDF lisible(s), '+failed+' en échec. Aucun document enregistré.');
 }finally{busy=false;button.disabled=false}
});
})();
