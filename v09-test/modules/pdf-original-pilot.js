/* AIA — pilote autonome. Le PDF source reste inchangé en mémoire. */
(async function(){
'use strict';
const input=document.getElementById('pdf'),open=document.getElementById('open'),save=document.getElementById('save'),pages=document.getElementById('pages'),status=document.getElementById('status');
let original=null,originalName='',busy=false;
function say(message){status.textContent=message}
function loadPdfjs(){
 if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);
 return new Promise((resolve,reject)=>{
  const js=document.createElement('script');
  js.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  js.onload=()=>window.pdfjsLib?resolve(window.pdfjsLib):reject(Error('Bibliothèque PDF absente'));
  js.onerror=()=>reject(Error('PDF.js indisponible : vérifie la connexion'));
  document.head.append(js);
 });
}
save.addEventListener('click',()=>{
 if(!original)return;
 const url=URL.createObjectURL(new Blob([original],{type:'application/pdf'}));
 const a=document.createElement('a');a.href=url;a.download=originalName||'fiche-originale.pdf';document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),2000);
});
open.addEventListener('click',async()=>{
 if(busy)return;
 const file=input.files&&input.files[0];
 if(!file||!(/\.pdf$/i.test(file.name)||file.type==='application/pdf')){say('Choisis un fichier PDF.');return}
 if(file.size>20*1024*1024){say('PDF trop volumineux pour ce pilote (maximum 20 Mo).');return}
 busy=true;open.disabled=true;save.disabled=true;original=null;pages.replaceChildren();say('Lecture du PDF original…');
 let pdf;
 try{
  const lib=await loadPdfjs();
  lib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const bytes=await file.arrayBuffer();
  pdf=await lib.getDocument({data:new Uint8Array(bytes.slice(0))}).promise;
  if(pdf.numPages>10)throw Error('Pilote limité à 10 pages.');
  let count=0;
  for(let n=1;n<=pdf.numPages;n++){
   const page=await pdf.getPage(n);
   const v=page.getViewport({scale:1});
   const fit=Math.min(1,Math.max(0.35,(Math.min(window.innerWidth-32,760))/v.width));
   const view=page.getViewport({scale:fit});
   const dpr=Math.min(window.devicePixelRatio||1,2);
   const canvas=document.createElement('canvas');
   canvas.width=Math.round(view.width*dpr);canvas.height=Math.round(view.height*dpr);
   canvas.style.width=view.width+'px';canvas.style.height=view.height+'px';
   const pageBox=document.createElement('section');pageBox.className='page';pageBox.style.width=view.width+'px';pageBox.style.height=view.height+'px';
   pageBox.setAttribute('aria-label','Page '+n+' du PDF original');
   const overlay=document.createElement('div');overlay.className='layer';overlay.setAttribute('aria-label','Liens bibliques détectés');
   pageBox.append(canvas,overlay);pages.append(pageBox);
   await page.render({canvasContext:canvas.getContext('2d'),viewport:page.getViewport({scale:fit*dpr})}).promise;
   const content=await page.getTextContent();
   for(const item of content.items){
    if(!item.str||item.str.length>52)continue; // éviter de recouvrir un paragraphe entier
    const ref=window.AIAPdfBible.parse(item.str);
    if(!ref)continue;
    const t=lib.Util.transform(view.transform,item.transform);
    const h=Math.max(9,Math.hypot(t[2],t[3]));
    const x=t[4],y=t[5]-h,w=item.width*fit;
    if(!Number.isFinite(x+y+w+h)||w<12||w>view.width*.65||x<0||y<0||x+w>view.width+2||y+h>view.height+2)continue;
    const a=document.createElement('a');a.className='bible-link';a.href=ref.url;a.target='_blank';a.rel='noopener noreferrer';
    a.style.left=x+'px';a.style.top=y+'px';a.style.width=w+'px';a.style.height=h+'px';
    a.title=ref.reference;a.setAttribute('aria-label','Lire '+ref.reference+' sur jw.org');overlay.append(a);count++;
   }
  }
  original=bytes;originalName=file.name;save.disabled=false;
  say(pdf.numPages+' page(s) affichée(s), '+count+' zone(s) de lien détectée(s). Contrôle visuel Android indispensable.');
 }catch(err){say('Affichage impossible : '+(err.message||'erreur PDF'));pages.replaceChildren();original=null;save.disabled=true}
 finally{try{await pdf?.destroy()}catch(_){}busy=false;open.disabled=false}
});
})();
