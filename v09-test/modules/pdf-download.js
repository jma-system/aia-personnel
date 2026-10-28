/* AIA V09-test : téléchargement PDF direct, sans impression Acrobat.
   jsPDF chargé à la demande ; aucune suppression des fiches locales. */
(() => {
'use strict';
const LIB='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js';
let loading;
function notify(s){if(typeof window.message==='function')window.message(s);else alert(s)}
function loadPdf(){
 if(window.jspdf?.jsPDF)return Promise.resolve(window.jspdf.jsPDF);
 if(loading)return loading;
 loading=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src=LIB;script.crossOrigin='anonymous';
  script.onload=()=>window.jspdf?.jsPDF?resolve(window.jspdf.jsPDF):reject(new Error('Bibliothèque PDF indisponible'));
  script.onerror=()=>reject(new Error('Chargement PDF impossible hors connexion'));
  document.head.append(script);
 }).catch(e=>{loading=null;throw e});
 return loading;
}
function filename(name){return (name||'fiche').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,55)||'fiche'}
function hasUnsupported(text){return /[^\u0000-\u00ff\u2013\u2014\u2018\u2019\u201c\u201d\u2026\u20ac]/u.test(text)}
function normalize(text){return text.replace(/[\u2013\u2014]/g,'-').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/\u2026/g,'...').replace(/\u20ac/g,'EUR')}
async function download(items){
 if(!items.length){notify('Aucune fiche à télécharger.');return}
 const all=items.map(d=>[d.title,d.body,d.publication,d.format,d.date].join('\n'));
 if(all.some(hasUnsupported)){notify('Caractères spéciaux détectés : utilise l’export PDF par impression pour préserver le texte.');return}
 try{
  notify('Préparation du PDF…');
  const JsPDF=await loadPdf();const pdf=new JsPDF({unit:'mm',format:'a4'});
  const margin=18,maxWidth=174;let y=20;
  function lines(text,size,bold=false){
   pdf.setFont('helvetica',bold?'bold':'normal');pdf.setFontSize(size);
   const split=pdf.splitTextToSize(normalize(text),maxWidth);
   const step=size*0.47;
   for(const line of split){if(y+step>277){pdf.addPage();y=20}pdf.text(line||' ',margin,y);y+=step}
  }
  items.forEach((d,i)=>{
   if(i){pdf.addPage();y=20}
   lines(d.title||'Fiche AIA',16,true);y+=3;
   lines([d.publication,d.format,d.date].filter(Boolean).join(' - '),10);y+=5;
   pdf.setDrawColor(115,125,140);
   const paragraphs=String(d.body||'').split(/\r?\n/);
   for(const p of paragraphs){if(!p.trim()){y+=4;continue}lines(p,12)}
  });
  const name=items.length===1?'AIA-'+filename(items[0].title)+'.pdf':'AIA-'+items.length+'-fiches.pdf';
  pdf.save(name);
  notify('Téléchargement demandé : vérifie le dossier Téléchargements.');
 }catch(e){notify('Téléchargement indisponible : '+e.message)}
}
function getDocs(){return Array.isArray(window.docs)?window.docs:eval('docs')}
function selectedDocs(){return getDocs().filter(d=>d.validated&&selected.has(d.id))}
function setup(){
 const viewer=document.getElementById('viewer');
 const pdfButton=[...viewer.querySelectorAll('button')].find(b=>b.textContent.trim()==='PDF');
 if(pdfButton){pdfButton.textContent='Télécharger PDF';pdfButton.onclick=()=>{const d=getDocs()[current];if(!d?.validated)return notify('Valide la fiche avant téléchargement.');download([d])}}
 const panel=document.getElementById('exportPanel');
 const group=[...panel.querySelectorAll('button')].find(b=>b.getAttribute('onclick')==='printSelected()');
 if(group){group.textContent='Télécharger PDF groupé';group.onclick=()=>download(selectedDocs())}\n const fallback=document.createElement('button');fallback.type='button';fallback.textContent='Imprimer / PDF classique';fallback.onclick=()=>window.printSelected();group?.parentElement.append(fallback);
 const hint=panel.querySelector('p.muted');
 if(hint)hint.textContent='Le PDF sera téléchargé sur ton téléphone. Tu pourras ensuite le déplacer manuellement vers Google Drive. Pour les caractères non pris en charge, conserve l’export par impression.';
}
setup();
})();
