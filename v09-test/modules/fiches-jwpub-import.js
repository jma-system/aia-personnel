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
  const manifest=JSON.parse(await outer.file('manifest.json').async('string'));
  const type=manifest.publication?.publicationType||'Publication';
  const pubInfo=query('SELECT MepsLanguageIndex,Symbol,Year,IssueTagNumber FROM Publication LIMIT 1')[0];
  const parts=[pubInfo.MepsLanguageIndex,pubInfo.Symbol,pubInfo.Year];
  if(pubInfo.IssueTagNumber&&String(pubInfo.IssueTagNumber)!=='0')parts.push(pubInfo.IssueTagNumber);
  const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(parts.join('_'))));
  const mask=Uint8Array.from('11cbb5587e32846d4c26790c633da289f66fe5842a3a585ce1bc3a294af5ada7'.match(/../g),v=>parseInt(v,16));
  const keybytes=mask.map((v,i)=>v^digest[i]);
  const key=await crypto.subtle.importKey('raw',keybytes.slice(0,16),{name:'AES-CBC'},false,['decrypt']);
  const iv=keybytes.slice(16);
  if(!('DecompressionStream' in window))throw Error('Décompression non prise en charge par ce navigateur.');
  async function decode(bytes){
   const decrypted=await crypto.subtle.decrypt({name:'AES-CBC',iv},key,bytes);
   const stream=new Blob([decrypted]).stream().pipeThrough(new DecompressionStream('deflate'));
   return new TextDecoder().decode(await new Response(stream).arrayBuffer());
  }
  const docs=query('SELECT DocumentId,Title,Content FROM Document WHERE Content IS NOT NULL ORDER BY DocumentId LIMIT 100');
  if(!docs.length)throw Error('Aucun document à lire.');
  const pages=[];
  for(const d of docs){try{pages.push(new DOMParser().parseFromString(await decode(d.Content),'text/html'))}catch(e){throw Error('Déchiffrement du contenu impossible : '+e.message)}}
  const media=new Map();
  for(const name of Object.keys(inner.files).filter(n=>/\\.(jpg|jpeg|png|webp)$/i.test(n))){
   const bytes=await inner.file(name).async('uint8array');
   media.set(name,URL.createObjectURL(new Blob([bytes],{type:/png$/i.test(name)?'image/png':'image/jpeg'})));
  }
  const article=pages.find(d=>d.querySelector('.openingContent,.bodyTxt'))||pages[pages.length-1];
  const cover=pages[0].querySelector('img')?.getAttribute('src')?.replace('jwpub-media://','');
  const illustration=article.querySelector('header img')?.getAttribute('src')?.replace('jwpub-media://','')||cover;
  const originalTitle=manifest.publication?.title||docs[0].Title||'Publication';
  const sheet=document.createElement('article');
  sheet.style.cssText='font-family:Verdana,Geneva,sans-serif;background:#e8f6ff;border-radius:16px;overflow:hidden;color:#071425;margin:12px 0';
  const header=document.createElement('div');header.style.cssText='background:#073a79;color:white;padding:12px 14px;font-size:16px;font-weight:bold';header.textContent=type+' — '+(manifest.publication?.shortTitle||originalTitle);sheet.append(header);
  const body=document.createElement('div');body.style.cssText='padding:12px';
  const heading=document.createElement('h3');heading.textContent=originalTitle;heading.style.cssText='font-size:18px;background:#cce9ff;padding:12px;border-left:6px solid #00cde7;border-radius:10px;margin:0 0 14px';body.append(heading);
  const columns=document.createElement('div');columns.style.cssText='display:grid;grid-template-columns:minmax(0,.96fr) minmax(0,1.04fr);gap:8px;align-items:start';
  if(illustration&&media.has(illustration)){const photo=document.createElement('img');photo.src=media.get(illustration);photo.alt=article.querySelector('header img')?.alt||'Illustration originale';photo.style.cssText='width:100%;border-radius:10px;display:block';columns.append(photo)}
  const texts=document.createElement('div');texts.style.cssText='display:flex;flex-direction:column;gap:7px;min-width:0';
  const sourceNodes=[...article.querySelectorAll('.openingContent p,.bodyTxt li p')];
  const books={19:'psaumes',23:'isa%C3%AFe',66:'r%C3%A9v%C3%A9lation'};
  function bibleLink(href){
   const m=href.match(/^jwpub:\\/\\/b\\/NWTR\\/(\\d+):(\\d+):(\\d+)/i);
   if(!m||!books[Number(m[1])])return null;
   const anchor=String(m[1]).padStart(2,'0')+String(m[2]).padStart(3,'0')+String(m[3]).padStart(3,'0');
   return 'https://www.jw.org/fr/biblioth%C3%A8que/bible/nwt/livres/'+books[Number(m[1])]+'/'+m[2]+'/#v'+anchor;
  }
  for(const source of sourceNodes){
   const card=document.createElement('div');card.style.cssText='border:1px solid #9cd6ef;border-radius:10px;padding:8px;background:#e9f6ff;font-size:12px;line-height:1.32;overflow-wrap:anywhere';
   for(const node of source.childNodes){
    if(node.nodeType===3){card.append(document.createTextNode(node.textContent))}
    else if(node.nodeType===1&&node.matches('a')){
     const url=bibleLink(node.getAttribute('href')||'');
     const link=document.createElement(url?'a':'span');link.textContent=node.textContent;
     if(url){link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.style.cssText='color:#0661c4;text-decoration:underline;font-weight:bold'}
     card.append(link);
    }else card.append(document.createTextNode(node.textContent));
   }
   texts.append(card);
  }
  columns.append(texts);body.append(columns);
  const actions=document.createElement('div');actions.style.cssText='display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:14px';
  const qr=document.createElement('a');qr.href='https://www.jw.org/fr/';qr.target='_blank';qr.rel='noopener noreferrer';qr.style.cssText='background:#d9edff;border:1px solid #67b7e2;border-radius:10px;display:flex;align-items:center;justify-content:center;min-height:48px';
  const qrImg=article.querySelector('img[src*="cnt_2"]');const qrName=qrImg?.getAttribute('src')?.replace('jwpub-media://','');
  if(qrName&&media.has(qrName)){const image=document.createElement('img');image.src=media.get(qrName);image.alt='QR officiel';image.style.cssText='width:44px;height:44px;object-fit:contain';qr.append(image)}else qr.textContent='JW.org';
  const pdf=document.createElement('button');pdf.textContent='↓ PDF';pdf.onclick=()=>window.print();
  const share=document.createElement('button');share.textContent='Partager';share.onclick=()=>{if(navigator.share)navigator.share({title:originalTitle,url:location.href}).catch(()=>{});else navigator.clipboard?.writeText(location.href)};
  for(const b of [pdf,share])b.style.cssText='background:#d9edff;border:1px solid #67b7e2;border-radius:10px;min-height:48px;font-size:12px;padding:4px';
  actions.append(qr,pdf,share);body.append(actions);sheet.append(body);
  const info=document.createElement('p');info.style.cssText='font-size:12px;color:#53657a';info.textContent='Lecture temporaire depuis le JWPUB original. Aucun enregistrement dans le Répertoire.';
  result.append(sheet,info);
  result.hidden=false;say('Publication lue : texte, illustration et références bibliques extraits.');
 }catch(e){say('Importation impossible : '+e.message,true)}
 finally{db?.close();btn.disabled=false}
});
})();
