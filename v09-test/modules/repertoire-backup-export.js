/* AIA Test — sauvegarde externe du Répertoire, lecture seule.
   N'écrit jamais dans IndexedDB et ne restaure aucune donnée. */
(()=>{
'use strict';
const DATABASE='aia-repertoire-v09-test', STORE='fiches', SUBTHEMES='sous-themes';
const LIMIT=80*1024*1024;
function readStore(db,name){
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(name,'readonly');
  const req=tx.objectStore(name).getAll();
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||Error('Lecture impossible : '+name));
  tx.onabort=()=>reject(tx.error||Error('Transaction interrompue'));
 });
}
function openExisting(){
 return new Promise((resolve,reject)=>{
  if(!('indexedDB' in window))return reject(Error('Stockage local indisponible'));
  const req=indexedDB.open(DATABASE);
  let created=false;
  req.onupgradeneeded=()=>{created=true;req.transaction.abort()};
  req.onsuccess=()=>created?(req.result.close(),reject(Error('Aucun répertoire sauvegardé sur ce navigateur'))):resolve(req.result);
  req.onerror=()=>reject(req.error||Error('Ouverture du Répertoire impossible'));
 });
}
async function encode(blob){
 return new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onload=()=>resolve(reader.result);
  reader.onerror=()=>reject(reader.error||Error('Lecture d’image impossible'));
  reader.readAsDataURL(blob);
 });
}
async function exportRepertoire(){
 let db;
 try{
  db=await openExisting();
  if(!db.objectStoreNames.contains(STORE))throw Error('Table des fiches absente');
  const entries=await readStore(db,STORE);
  const subthemes=db.objectStoreNames.contains(SUBTHEMES)?await readStore(db,SUBTHEMES):[];
  let total=0;
  const fiches=[];
  for(const entry of entries){
   if(!(entry.blob instanceof Blob))throw Error('Fiche sans image : export interrompu');
   total+=entry.blob.size;
   if(total>LIMIT)throw Error('Répertoire supérieur à 80 Mo : export interrompu');
   const {blob,...meta}=entry;
   fiches.push({...meta,imageData:await encode(blob)});
  }
  const doc={schema:'aia-repertoire-export-v1',exportedAt:new Date().toISOString(),source:DATABASE,items:fiches,subthemes};
  const json=JSON.stringify(doc);
  const file=new Blob([json],{type:'application/json'});
  const url=URL.createObjectURL(file);
  const a=document.createElement('a');a.href=url;
  a.download='AIA-Repertoire-sauvegarde-'+new Date().toISOString().slice(0,10)+'.json';
  document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
  return fiches.length;
 }finally{if(db)db.close()}
}
function mount(){
 const panel=document.getElementById('indexPanel');
 if(!panel||document.getElementById('aia-backup-export'))return;
 const wrap=document.createElement('div');wrap.className='actions';wrap.style.margin='12px 0';
 const button=document.createElement('button');button.type='button';button.id='aia-backup-export';button.textContent='Sauvegarder le Répertoire';
 const status=document.createElement('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.style.fontSize='13px';
 button.addEventListener('click',async()=>{
  button.disabled=true;status.textContent='Préparation de la sauvegarde…';
  try{const count=await exportRepertoire();status.textContent=count+' fiche(s) préparée(s). Vérifie le téléchargement dans ton téléphone, puis copie ce fichier hors du navigateur.'}
  catch(err){status.textContent='Sauvegarde non réalisée : '+(err.message||'erreur inconnue')}
  finally{button.disabled=false}
 });
 wrap.append(button,status);panel.prepend(wrap);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
