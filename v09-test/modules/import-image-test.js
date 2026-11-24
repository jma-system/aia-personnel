/* AIA — Répertoire permanent (test) : IndexedDB, photos et classements.
   Stockage local à cet appareil/navigateur. Drive reste sauvegarde externe. */
(()=>{
'use strict';
const section=document.getElementById('indexPanel');
const area=section?.querySelector('.aia-index-content');
if(!section||!area)return;
const topics=['L’avenir','La famille','Dieu','La prière','Jésus','Le Royaume de Dieu','Les souffrances','La mort','La religion','Actualité'];
const categories=['TRACTS','FICHES'];
const allowed=new Set(['image/png','image/jpeg','image/webp']);
const records=[];
const dbName='aia-repertoire-v09-test';
const storeName='fiches';
let db=null,ready=false,request=null,focusBefore=null,replaceId=null;
const picker=document.createElement('input');
picker.type='file';picker.accept='image/png,image/jpeg,image/webp';picker.hidden=true;picker.multiple=true;
section.append(picker);
const viewer=document.createElement('div');
viewer.className='aia-photo-viewer';viewer.hidden=true;
viewer.setAttribute('role','dialog');viewer.setAttribute('aria-modal','true');viewer.setAttribute('aria-label','Image agrandie');
const close=document.createElement('button');close.type='button';close.className='aia-photo-close';
close.textContent='×';close.setAttribute('aria-label','Fermer');
const large=document.createElement('img');large.alt='Fiche agrandie';
viewer.append(close,large);document.body.append(viewer);
function openImage(item){
 focusBefore=document.activeElement;large.src=item.url;large.alt=item.label;
 viewer.hidden=false;document.body.style.overflow='hidden';close.focus();
}
function closeImage(){
 viewer.hidden=true;large.removeAttribute('src');document.body.style.overflow='';
 if(focusBefore?.isConnected)focusBefore.focus();
 focusBefore=null;
}
close.onclick=closeImage;
viewer.addEventListener('click',e=>{if(e.target===viewer)closeImage()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!viewer.hidden)closeImage()});
function labelFrom(filename){return filename.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim()||'Fiche'}
function refresh(){section.dispatchEvent(new Event('aia:refresh-index'))}
function note(msg){const p=document.createElement('p');p.className='aia-gallery-count';p.textContent=msg;area.append(p)}
function openDatabase(){
 return new Promise((resolve,reject)=>{
  if(!('indexedDB'in window)){reject(new Error('IndexedDB indisponible'));return}
  const req=indexedDB.open(dbName,1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(storeName))req.result.createObjectStore(storeName,{keyPath:'id'})};
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||new Error('Ouverture impossible'));
 });
}
function operation(mode,perform){
 return new Promise((resolve,reject)=>{
  if(!db){reject(new Error('Stockage indisponible'));return}
  const tx=db.transaction(storeName,mode);
  const object=tx.objectStore(storeName);
  let result;
  try{result=perform(object)}catch(error){try{tx.abort()}catch(_){}reject(error);return}
  if(result&&typeof result==='object'&&'onsuccess'in result){
   result.onsuccess=()=>{result=result.result};
  }
  tx.oncomplete=()=>resolve(result);
  tx.onerror=()=>reject(tx.error||new Error('Échec de stockage'));
  tx.onabort=()=>reject(tx.error||new Error('Transaction annulée'));
 });
}
function makeRecord(raw){return {...raw,url:URL.createObjectURL(raw.blob)}}
function discard(item){if(item?.url)URL.revokeObjectURL(item.url)}
async function save(item){
 const raw={id:item.id,blob:item.blob,label:item.label,topic:item.topic,placements:item.placements};
 await operation('readwrite',store=>store.put(raw));
 const index=records.findIndex(r=>r.id===item.id);
 if(index>=0){discard(records[index]);records[index]=makeRecord(raw)}
 else records.push(makeRecord(raw));
 refresh();
}
async function removeEverywhere(item){
 await operation('readwrite',store=>store.delete(item.id));
 const index=records.findIndex(r=>r.id===item.id);
 if(index>=0){discard(records[index]);records.splice(index,1)}
 refresh();
}
async function removeHere(item,category,letter){
 const remain=item.placements.filter(p=>!(p.category===category&&p.letter===letter));
 if(!remain.length){await removeEverywhere(item);return}
 await save({...item,placements:remain});
}
function controlled(btn,fn){
 btn.addEventListener('click',async()=>{
  if(btn.disabled)return;
  btn.disabled=true;
  try{await fn()}catch(error){alert('Modification impossible : '+(error?.message||'erreur de stockage'))}
  finally{if(btn.isConnected)btn.disabled=false}
 });
 return btn;
}
function makeButton(text,cls){
 const button=document.createElement('button');
 button.type='button';button.textContent=text;button.className=cls||'aia-gallery-action';
 return button;
}
function choicesFor(item,category,letter){
 const wrap=document.createElement('details');wrap.className='aia-gallery-item-actions';
 const summary=document.createElement('summary');summary.textContent='Gérer cette fiche';wrap.append(summary);
 const select=document.createElement('select');select.className='aia-gallery-select';
 select.setAttribute('aria-label','Autre onglet');
 for(const cat of categories){
  const option=document.createElement('option');option.value=cat;option.textContent=cat;select.append(option)
 }
 select.value=category==='TRACTS'?'FICHES':'TRACTS';
 const add=controlled(makeButton('Classer aussi dans cet onglet'),async()=>{
  const dest={category:select.value,letter};
  if(item.placements.some(p=>p.category===dest.category&&p.letter===dest.letter))return;
  await save({...item,placements:[...item.placements,dest]});
 });
 const replace=makeButton('Remplacer l’image');
 replace.addEventListener('click',()=>{
  request=null;replaceId=item.id;picker.multiple=false;picker.click();
 });
 const here=controlled(makeButton('Retirer de '+category),async()=>{
  if(!confirm('Retirer cette fiche de '+category+' sous '+letter+' ?'))return;
  await removeHere(item,category,letter);
 });
 const everywhere=controlled(makeButton('Supprimer partout'),async()=>{
  if(!confirm('Supprimer cette fiche de tous les onglets du Répertoire AIA ?'))return;
  await removeEverywhere(item);
 });
 wrap.append(select,add,replace,here,everywhere);
 return wrap;
}
function thumb(item){
 const btn=makeButton('', 'aia-gallery-card');
 btn.setAttribute('aria-label','Ouvrir '+item.label);
 const image=document.createElement('img');image.src=item.url;image.alt='';
 const title=document.createElement('span');title.textContent=item.label;
 btn.append(image,title);btn.onclick=()=>openImage(item);return btn;
}
function gallery(items,category,letter,theme){
 const grid=document.createElement('div');grid.className='aia-gallery-grid';
 for(const item of items){
  const cell=document.createElement('div');cell.className='aia-gallery-cell';
  cell.append(thumb(item));
  if(category&&letter)cell.append(choicesFor(item,category,letter));
  if(theme){
   const details=document.createElement('details');details.className='aia-gallery-item-actions';
   const summary=document.createElement('summary');summary.textContent='Gérer cette fiche';details.append(summary);
   const unlink=controlled(makeButton('Retirer du thème'),async()=>{
    if(!confirm('Retirer cette fiche du thème '+theme+' ?'))return;
    await save({...item,topic:''});
   });
   const replace=makeButton('Remplacer l’image');replace.onclick=()=>{request=null;replaceId=item.id;picker.multiple=false;picker.click()};
   const all=controlled(makeButton('Supprimer partout'),async()=>{
    if(!confirm('Supprimer cette fiche de tous les onglets ?'))return;
    await removeEverywhere(item);
   });
   details.append(unlink,replace,all);cell.append(details);
  }
  grid.append(cell);
 }
 return grid;
}
function categoryView(category,letter){
 if(!categories.includes(category)||!letter)return;
 if(!ready){note('Ouverture du stockage…');return}
 if(!db){note('Stockage indisponible sur ce navigateur.');return}
 const wrap=document.createElement('div');wrap.className='aia-gallery-controls';
 const topicLabel=document.createElement('label');topicLabel.className='aia-gallery-label';topicLabel.textContent='Thème associé (facultatif)';
 const topic=document.createElement('select');topic.className='aia-gallery-select';
 const blank=document.createElement('option');blank.value='';blank.textContent='Aucun thème';topic.append(blank);
 for(const name of topics){const o=document.createElement('option');o.value=name;o.textContent=name;topic.append(o)}
 topicLabel.append(topic);
 const add=makeButton('Importer des images sous '+letter,'aia-import-button');
 add.onclick=()=>{request={category,letter,topic:topic.value};replaceId=null;picker.multiple=true;picker.click()};
 wrap.append(add,topicLabel);area.append(wrap);
 const matches=records.filter(r=>r.placements.some(p=>p.category===category&&p.letter===letter));
 area.querySelector('p.muted')?.remove();
 note(matches.length+' fiche'+(matches.length===1?'':'s')+' enregistrée'+(matches.length===1?'':'s'));
 if(matches.length)area.append(gallery(matches,category,letter));
}
picker.addEventListener('change',async()=>{
 const files=Array.from(picker.files||[]);
 picker.value='';
 if(!files.length)return;
 const toReplace=replaceId;
 const target=request;
 replaceId=null;request=null;
 if(!db){alert('Stockage indisponible.');return}
 let invalid=0,errors=0,saved=0;
 for(const file of files){
  if(!allowed.has(file.type)||file.size>15*1024*1024){invalid++;continue}
  try{
   if(toReplace){
    const current=records.find(r=>r.id===toReplace);
    if(!current)throw new Error('Fiche introuvable');
    await save({...current,blob:file,label:labelFrom(file.name)});
   }else if(target){
    const item={id:crypto.randomUUID(),blob:file,label:labelFrom(file.name),
      topic:target.topic,placements:[{category:target.category,letter:target.letter}]};
    await save(item);
   }else return;
   saved++;
  }catch(error){errors++;console.error('AIA import : ',error)}
 }
 if(errors||invalid)alert(saved+' fiche(s) enregistrée(s). '+invalid+' format(s) ignoré(s), '+errors+' erreur(s) de stockage.');
});
section.addEventListener('aia:index-render',e=>{
 const {category,letter}=e.detail||{};
 if(category==='THÈMES'){
  if(!ready)return;
  for(const tile of area.querySelectorAll('.aia-index-tile')){
   const name=tile.querySelector('strong')?.textContent;
   const item=records.find(r=>r.topic===name);
   const pic=tile.querySelector('.aia-index-placeholder');
   if(item&&pic){const img=document.createElement('img');img.src=item.url;img.alt='';img.className='aia-family-thumb';pic.replaceWith(img)}
  }
  return;
 }
 categoryView(category,letter);
});
section.addEventListener('aia:theme-select',e=>{
 const theme=e.detail?.theme;
 if(!topics.includes(theme))return;
 const matches=records.filter(r=>r.topic===theme);
 if(!matches.length)return;
 e.preventDefault();area.replaceChildren();
 const heading=document.createElement('h3');heading.textContent=theme;
 const back=makeButton('Retour aux thèmes','aia-gallery-back');
 back.onclick=refresh;area.append(heading,back,gallery(matches,null,null,theme));
});
window.addEventListener('pagehide',()=>{
 closeImage();records.forEach(discard);db?.close();
},{once:true});
(async()=>{
 try{
  db=await openDatabase();
  const stored=await operation('readonly',store=>store.getAll());
  for(const raw of stored){
   if(raw&&raw.blob instanceof Blob&&Array.isArray(raw.placements))records.push(makeRecord(raw));
  }
 }catch(error){console.error('AIA IndexedDB : ',error);db=null}
 finally{ready=true;refresh()}
})();
})();
