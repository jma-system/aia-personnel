/* AIA — Importation JWPUB des fiches dans Répertoire. Lecture locale, sans stockage. */
(()=>{
'use strict';
const panel=document.getElementById('indexPanel');
const tabs=panel?.querySelector('.aia-index-tabs');
if(!panel||!tabs)return;
const box=document.createElement('section');
box.id='aia-fiches-jwpub-import';
box.style.cssText='padding:14px;margin:0 0 14px;background:#fff;border:1px solid #b7ccdf;border-radius:12px;color:#172d44';
box.innerHTML='<h2 style="margin:0 0 12px;font-size:19px">Importer les fiches JWPUB</h2><label for="aia-fiches-jwpub-file" style="font-size:15px;font-weight:700">1. Choisir le fichier des fiches</label><input id="aia-fiches-jwpub-file" type="file" accept=".jwpub,.zip,application/zip,application/octet-stream" style="display:block;width:100%;margin:8px 0 14px;padding:12px;border:1px dashed #92abc3;border-radius:9px;background:white"><button id="aia-fiches-jwpub-read" type="button" style="background:#17639a;color:white;min-height:48px;padding:10px 14px;border:0;border-radius:9px">Lire les fiches</button><p id="aia-fiches-jwpub-status" role="status" style="font-size:14px;margin:13px 0 0">Prêt pour l’importation.</p><div id="aia-fiches-jwpub-result" hidden style="margin-top:12px"></div>';
tabs.before(box);
const file=box.querySelector('#aia-fiches-jwpub-file');
const btn=box.querySelector('#aia-fiches-jwpub-read');
const status=box.querySelector('#aia-fiches-jwpub-status');
const result=box.querySelector('#aia-fiches-jwpub-result');
function say(t,error=false){status.textContent=t;status.style.color=error?'#a52b2b':'#166b42'}
async function library(url,check){if(check())return;await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.onload=resolve;s.onerror=()=>reject(Error('Bibliothèque de lecture indisponible : connexion nécessaire.'));document.head.append(s)})}
function extractText(html){const doc=new DOMParser().parseFromString(html,'text/html');doc.querySelectorAll('script,style,nav').forEach(e=>e.remove());return (doc.body?.textContent||'').replace(/\s+/g,' ').trim()}
btn.addEventListener('click',async()=>{
 if(!file.files?.length){say('Choisis d’abord un fichier JWPUB.',true);return}
 btn.disabled=true;result.hidden=true;result.replaceChildren();say('Lecture du fichier en cours…');
 let db;
 try{
  await library('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',()=>!!window.JSZip);
  await library('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/sql-wasm.js',()=>!!window.initSqlJs);
  const outer=await window.JSZip.loadAsync(await file.files[0].arrayBuffer());
  const contents=outer.file('contents');
  if(!contents||!outer.file('manifest.json'))throw Error('Le fichier sélectionné n’est pas une archive JWPUB complète.');
  const inner=await window.JSZip.loadAsync(await contents.async('uint8array'));
  const dbPath=Object.keys(inner.files).find(n=>n.endsWith('.db'));
  if(!dbPath)throw Error('Base de données JWPUB introuvable.');
  const SQL=await window.initSqlJs({locateFile:f=>'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/'+f});
  db=new SQL.Database(await inner.file(dbPath).async('uint8array'));
  function query(sql){const stmt=db.prepare(sql),rows=[];try{while(stmt.step())rows.push(stmt.getAsObject())}finally{stmt.free()}return rows}
  const pub=query('SELECT Symbol,Year FROM Publication LIMIT 1')[0];
  if(!pub)throw Error('Publication non reconnue.');
  const docs=query('SELECT DISTINCT Title,Subtitle FROM Document WHERE Title IS NOT NULL LIMIT 250');
  const names=[...new Set(docs.map(d=>[d.Title,d.Subtitle].filter(Boolean).join(' — ').replace(/<[^>]*>/g,'').trim()).filter(Boolean))];
  const manifest=JSON.parse(await outer.file('manifest.json').async('string'));
  const type=manifest.publication?.publicationType||'Publication';
  const title=document.createElement('h3');title.textContent=type+' — '+(manifest.publication?.title||pub.Symbol);
  const count=document.createElement('p');count.textContent=names.length+' titre(s) distinct(s). '+(type.toLowerCase()==='tract'?'Classement proposé : TRACTS — A (Avenir).':'Classement à confirmer selon la publication.')+' Lecture des visuels originaux, sans enregistrement.';
  result.append(title,count);
  if(names.length){const list=document.createElement('ol');list.style.cssText='max-height:270px;overflow:auto;padding-left:24px';names.forEach(n=>{const li=document.createElement('li');li.textContent=n;list.append(li)});result.append(list)}
  const photos=Object.keys(inner.files).filter(n=>/\.(jpe?g|png|webp)$/i.test(n)&&!/-120x120|-270x270|-600x600/.test(n));
  const full=document.createElement('div');full.hidden=true;full.style.cssText='position:fixed;inset:0;z-index:999999;background:#111;overflow:auto;padding:64px 14px 24px;text-align:center';
  const close=document.createElement('button');close.textContent='× Fermer';close.style.cssText='position:fixed;top:12px;right:12px;background:#fff;color:#13243b;padding:10px 15px;z-index:2';
  const big=document.createElement('img');big.alt='Illustration originale du JWPUB';big.style.cssText='display:block;margin:auto;max-width:100%;max-height:calc(100dvh - 100px);object-fit:contain';
  close.onclick=()=>{full.hidden=true;big.removeAttribute('src')};full.append(close,big);document.body.append(full);
  function openPicture(url,name){big.src=url;big.alt=name;full.hidden=false}
  if(photos.length){
   const gallery=document.createElement('div');
   gallery.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px';
   for(const name of photos){
    const blob=new Blob([await inner.file(name).async('uint8array')],{type:/png$/i.test(name)?'image/png':'image/jpeg'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('button');a.type='button';a.title='Afficher l’illustration originale en grand';a.style.cssText='padding:0;border:0;background:transparent;min-width:0';a.onclick=()=>openPicture(url,name);
    const img=document.createElement('img');img.src=url;img.alt='Illustration originale '+name;img.style.cssText='width:100%;height:190px;object-fit:contain;border:1px solid #b7ccdf;border-radius:8px;background:#f4f8fc';
    a.append(img);gallery.append(a);
   }
   const h=document.createElement('h4');h.textContent='Illustrations de la publication — toucher pour agrandir';result.append(h,gallery);
   const note=document.createElement('p');note.style.cssText='font-size:13px;line-height:1.45;color:#596b7e';note.textContent='Le texte intégral du JWPUB est chiffré dans sa base de données. Il ne peut pas encore être affiché ici : aucune transcription n’est inventée.';result.append(note);
  }
  result.hidden=false;say('Publication reconnue : '+type+'. Illustrations consultables en grand.');
 }catch(e){say('Importation impossible : '+e.message,true)}
 finally{db?.close();btn.disabled=false}
});
})();
