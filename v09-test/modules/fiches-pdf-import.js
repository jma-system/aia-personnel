/* AIA — Import PDF dans Répertoire, sans sauvegarde automatique. */
(()=>{
'use strict';
const panel=document.getElementById('indexPanel');
const tabs=panel?.querySelector('.aia-index-tabs');
if(!panel||!tabs)return;
const box=document.createElement('section');
box.id='aia-fiches-pdf-import';
box.style.cssText='padding:14px;margin:0 0 14px;background:#fff;border:1px solid #b7ccdf;border-radius:12px;color:#172d44';
box.innerHTML='<h2 style="margin:0 0 12px;font-size:19px">Importer un PDF dans le Répertoire</h2><label for="aia-fiches-pdf-file" style="font-weight:bold">1. Choisir le fichier PDF</label><input id="aia-fiches-pdf-file" type="file" accept=".pdf,application/pdf" style="display:block;width:100%;margin:8px 0 14px;padding:12px;border:1px dashed #92abc3;border-radius:9px;background:white"><button id="aia-fiches-pdf-read" type="button" style="background:#17639a;color:white;min-height:48px;padding:10px 14px;border:0;border-radius:9px">Créer la fiche depuis le PDF</button><p id="aia-fiches-pdf-status" role="status">Prêt pour l’importation.</p><div id="aia-fiches-pdf-result" hidden></div>';
tabs.before(box);
const file=box.querySelector('input'),button=box.querySelector('button'),status=box.querySelector('[role=status]'),result=box.querySelector('#aia-fiches-pdf-result');
function say(message,error=false){status.textContent=message;status.style.color=error?'#a52b2b':'#166b42'}
function loadScript(){if(window.pdfjsLib)return Promise.resolve();return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';s.onload=resolve;s.onerror=()=>reject(Error('Impossible de charger le lecteur PDF. Vérifie la connexion.'));document.head.append(s)})}
button.addEventListener('click',async()=>{
 if(!file.files?.length){say('Choisis un PDF.',true);return}
 button.disabled=true;result.hidden=true;result.replaceChildren();say('Lecture et préparation du PDF…');
 try{
  await loadScript();
  const pdfjs=window.pdfjsLib;
  pdfjs.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const pdf=await pdfjs.getDocument({data:new Uint8Array(await file.files[0].arrayBuffer())}).promise;
  if(pdf.numPages>30)throw Error('Ce premier import accepte au maximum 30 pages.');
  const pages=[],lines=[],urls=[];
  for(let i=1;i<=pdf.numPages;i++){
   const page=await pdf.getPage(i);
   const text=await page.getTextContent();
   let currentY=null,current='';
   for(const item of text.items){
    if(!item.str)continue;
    const y=Math.round(item.transform?.[5]||0);
    if(currentY!==null&&Math.abs(y-currentY)>3){if(current.trim())lines.push(current.trim());current=''}
    currentY=y;current+=(current?' ':'')+item.str;
   }
   if(current.trim())lines.push(current.trim());
   for(const annotation of await page.getAnnotations()){if(annotation.url&&/^https:\/\//i.test(annotation.url))urls.push(annotation.url)}
   const viewport=page.getViewport({scale:Math.min(2,720/page.getViewport({scale:1}).width)});
   const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
   await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
   pages.push(canvas.toDataURL('image/jpeg',0.88));
   page.cleanup();
  }
  const title=(lines.find(x=>x.length>10&&!/^T-[a-z]/i.test(x))||file.files[0].name).replace(/\s+/g,' ');
  const sheet=document.createElement('article');sheet.style.cssText='background:#e8f6ff;border-radius:17px;overflow:hidden;color:#10283e;font-family:Verdana,Arial,sans-serif;margin:14px 0';
  const header=document.createElement('div');header.style.cssText='background:#073a79;color:white;font-weight:bold;padding:13px';header.textContent='PDF — '+file.files[0].name;sheet.append(header);
  const body=document.createElement('div');body.style.cssText='padding:12px';
  const h=document.createElement('h3');h.textContent=title;h.style.cssText='font-size:18px;margin:0 0 12px';body.append(h);
  const intro=document.createElement('p');intro.textContent='Document original — '+pdf.numPages+' page(s). Les pages sont reproduites fidèlement ci-dessous.';intro.style.cssText='font-size:12px';body.append(intro);
  const gallery=document.createElement('div');gallery.style.cssText='display:grid;gap:12px';
  pages.forEach((src,i)=>{const img=document.createElement('img');img.src=src;img.alt='Page '+(i+1)+' du PDF original';img.style.cssText='display:block;width:100%;height:auto;border:1px solid #b7ccdf;border-radius:8px;background:white';gallery.append(img)});
  body.append(gallery);
  const extracted=document.createElement('details');extracted.style.cssText='margin-top:15px;padding:10px;border:1px solid #9cd6ef;border-radius:10px;background:white';
  const summary=document.createElement('summary');summary.textContent='Texte extrait du PDF ('+lines.length+' lignes)';extracted.append(summary);
  const content=document.createElement('div');content.style.cssText='font-size:13px;line-height:1.5;white-space:pre-wrap;margin-top:10px';content.textContent=lines.join('\n');extracted.append(content);body.append(extracted);
  if(urls.length){const p=document.createElement('p');p.textContent='Liens présents dans le PDF :';body.append(p);for(const url of [...new Set(urls)]){const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Ouvrir le lien officiel';a.style.cssText='display:block;margin:8px 0;color:#0659ad';body.append(a)}}
  const actions=document.createElement('div');actions.style.cssText='display:flex;gap:8px;margin-top:15px;flex-wrap:wrap';
  const download=document.createElement('button');download.textContent='Télécharger le PDF original';download.style.cssText='background:#17639a;color:white;padding:12px;border:0;border-radius:8px';download.onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(file.files[0]);a.download=file.files[0].name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000)};
  actions.append(download);body.append(actions);sheet.append(body);result.append(sheet);
  const note=document.createElement('p');note.textContent='Aperçu non enregistré. Les références bibliques devront être reliées et validées avant de créer une fiche synthétique au format FAMILLE.';note.style.cssText='font-size:12px;color:#53657a';result.append(note);
  result.hidden=false;say('PDF lu : '+pdf.numPages+' page(s), texte et images affichés. À valider avant classement.');
 }catch(error){say('Lecture impossible : '+error.message,true)}
 finally{button.disabled=false}
});
})();
