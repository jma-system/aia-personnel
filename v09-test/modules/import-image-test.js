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
const customSubthemes=[];
const selectedSubtheme=new Map();
const extraStore='sous-themes';
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
// Bloquer uniquement le menu contextuel natif sur les images du Répertoire.
// Les clics courts, la sélection multiple et les boutons restent opérationnels.
function preventImageContextMenu(event){
 if(event.target.closest('img'))event.preventDefault();
}
section.addEventListener('contextmenu',event=>{
 if(event.target.closest('.aia-gallery-card'))preventImageContextMenu(event);
});
viewer.addEventListener('contextmenu',preventImageContextMenu);
large.draggable=false;
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
  const req=indexedDB.open(dbName,2);
  req.onupgradeneeded=()=>{
   if(!req.result.objectStoreNames.contains(storeName))req.result.createObjectStore(storeName,{keyPath:'id'});
   if(!req.result.objectStoreNames.contains(extraStore))req.result.createObjectStore(extraStore,{keyPath:'id'});
  };
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||new Error('Ouverture impossible'));
 });
}
function operation(mode,perform,store=storeName){
 return new Promise((resolve,reject)=>{
  if(!db){reject(new Error('Stockage indisponible'));return}
  const tx=db.transaction(store,mode);
  const object=tx.objectStore(store);
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
 const raw={id:item.id,blob:item.blob,label:item.label,topic:item.topic,subtheme:item.subtheme||'',placements:item.placements};
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
function thumb(item){
 const btn=makeButton('', 'aia-gallery-card');
 btn.setAttribute('aria-label','Ouvrir '+item.label);
 const image=document.createElement('img');image.src=item.url;image.alt='';image.draggable=false;
 btn.append(image);
 // Masquer les noms purement numériques attribués aux photos (ex. 40495).
 if(!/^\d+$/.test(item.label.trim())){
  const title=document.createElement('span');title.textContent=item.label;btn.append(title);
 }
 btn.onclick=()=>openImage(item);return btn;
}
function gallery(items,category='',letter='',theme=''){
 const wrap=document.createElement('div');wrap.className='aia-gallery-list';
 const bar=document.createElement('div');bar.className='aia-gallery-selection-bar';
 const choose=makeButton('Sélectionner','aia-gallery-choose');
 choose.setAttribute('aria-pressed','false');
 const count=document.createElement('span');count.className='aia-gallery-selected-count';
 count.setAttribute('aria-live','polite');
 const trash=makeButton('🗑','aia-gallery-batch-trash');
 trash.setAttribute('aria-label','Supprimer les images sélectionnées');
 trash.title='Supprimer la sélection';trash.disabled=true;
 bar.append(choose,count,trash);
 const grid=document.createElement('div');grid.className='aia-gallery-grid';
 const selectedIds=new Set();
 let selectionActive=false;
 const cells=[];
 function update(){
  choose.textContent=selectionActive?'Annuler':'Sélectionner';
  choose.setAttribute('aria-pressed',String(selectionActive));
  count.textContent=selectionActive?selectedIds.size+' sélectionnée'+(selectedIds.size>1?'s':''):'';
  trash.disabled=!selectionActive||selectedIds.size===0;
  grid.classList.toggle('is-selecting',selectionActive);
  for(const {item,button,tick} of cells){
   const checked=selectedIds.has(item.id);
   button.classList.toggle('is-selected',checked);
   button.setAttribute('aria-pressed',selectionActive?String(checked):'false');
   button.setAttribute('aria-label',selectionActive?(checked?'Désélectionner ':'Sélectionner ')+item.label:'Ouvrir '+item.label);
   tick.hidden=!selectionActive;
   tick.textContent=checked?'✓':'';
  }
 }
 for(const item of items){
  const cell=document.createElement('div');cell.className='aia-gallery-cell';
  const button=thumb(item);
  const tick=document.createElement('span');tick.className='aia-gallery-tick';
  tick.hidden=true;tick.setAttribute('aria-hidden','true');
  button.append(tick);
  button.onclick=()=>{
   if(!selectionActive){openImage(item);return}
   if(selectedIds.has(item.id))selectedIds.delete(item.id);
   else selectedIds.add(item.id);
   update();
  };
  cell.append(button);grid.append(cell);cells.push({item,button,tick});
 }
 choose.onclick=()=>{
  selectionActive=!selectionActive;
  selectedIds.clear();
  update();
 };
 controlled(trash,async()=>{
  if(!selectionActive||!selectedIds.size)return;
  const targets=items.filter(item=>selectedIds.has(item.id));
  const place=theme?'du thème '+theme:'de '+category+' sous '+letter;
  if(!confirm('Supprimer '+targets.length+' image(s) '+place+' ?'))return;
  // Une seule transaction : toutes les suppressions réussissent ou aucune.
  const edits=targets.map(item=>{
   if(theme)return {...item,topic:''};
   const remaining=item.placements.filter(p=>!(p.category===category&&p.letter===letter));
   return remaining.length?{...item,placements:remaining}:null;
  });
  await operation('readwrite',store=>{
   edits.forEach((edit,i)=>{
    if(edit){
     store.put({id:edit.id,blob:edit.blob,label:edit.label,topic:edit.topic,
       subtheme:edit.subtheme||'',placements:edit.placements});
    }else store.delete(targets[i].id);
   });
  });
  for(let i=0;i<targets.length;i++){
   const item=targets[i],index=records.findIndex(r=>r.id===item.id);
   if(index<0)continue;
   discard(records[index]);
   if(edits[i])records[index]=makeRecord(edits[i]);
   else records.splice(index,1);
  }
  refresh();
 });
 const heading=area.querySelector('.aia-subtheme-heading')||(theme?area.querySelector('h3'):null);
 if(heading){
  const header=document.createElement('div');header.className='aia-gallery-heading-row';
  heading.replaceWith(header);header.append(heading,bar);
  wrap.append(grid);
 }else{
  wrap.append(bar,grid);
 }
 update();
 return wrap;
}
// Sous-thèmes horizontaux pour chaque lettre de A à Z.
function normalized(text){
 return text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleUpperCase('fr-FR');
}
function startsWithLetter(text,letter){
 return normalized(text).startsWith(letter);
}
function existingSubtheme(item,letter){
 if(item.subtheme)return item.subtheme;
 if(item.topic){
  const short=item.topic.replace(/^(?:La |Le |Les |L’|L')/i,'');
  if(startsWithLetter(short,letter))return short;
 }
 return 'Autres';
}
function isUnder(item,category,letter){
 return item.placements.some(p=>p.category===category&&p.letter===letter);
}
function categoryView(category,letter){
 if(!categories.includes(category)||!letter)return;
 if(!ready){note('Ouverture du stockage…');return}
 if(!db){note('Stockage indisponible sur ce navigateur.');return}
 const key=category+'|'+letter;
 const items=records.filter(item=>isUnder(item,category,letter));
 // Initialiser F avec les sous-thèmes déjà validés. Sur les autres lettres,
 // les noms sont créés par l'utilisateur ou issus des fiches existantes.
 const names=letter==='F'?['Famille','Foi']:[];
 for(const entry of customSubthemes){
  if(entry.category===category&&entry.letter===letter)names.push(entry.name);
 }
 for(const item of items)names.push(existingSubtheme(item,letter));
 const unique=[...new Set(names)];
 const selected=unique.includes(selectedSubtheme.get(key))
  ?selectedSubtheme.get(key):(unique[0]||'');
 selectedSubtheme.set(key,selected);
 const wrap=document.createElement('div');wrap.className='aia-gallery-controls';
 const bar=document.createElement('div');
 bar.className='aia-subtheme-strip';
 bar.setAttribute('aria-label','Sous-thèmes sous '+letter);
 for(const name of unique){
  const button=makeButton(name,'aia-subtheme-tab');
  const active=name===selected;
  button.classList.toggle('selected',active);
  button.setAttribute('aria-pressed',String(active));
  button.onclick=()=>{selectedSubtheme.set(key,name);refresh()};
  bar.append(button);
 }
 const create=makeButton('+ Ajouter','aia-subtheme-add');
 create.onclick=async()=>{
  const response=prompt('Nouveau sous-thème sous '+letter+' :');
  if(response===null)return;
  const name=response.trim().replace(/\s+/g,' ').slice(0,45);
  if(!name){alert('Saisis un nom de sous-thème.');return}
  if(!startsWithLetter(name,letter)){
   alert('Choisis un sous-thème commençant par la lettre '+letter+'.');return;
  }
  const current=unique.find(x=>normalized(x)===normalized(name));
  if(current){selectedSubtheme.set(key,current);refresh();return}
  const entry={id:category+'|'+letter+'|'+normalized(name),category,letter,name};
  try{
   await operation('readwrite',store=>store.put(entry),extraStore);
   customSubthemes.push(entry);
   selectedSubtheme.set(key,name);
   refresh();
  }catch(error){alert('Enregistrement impossible : '+(error?.message||'erreur'))}
 };
 bar.append(create);wrap.append(bar);
 if(selected){
  const add=makeButton('Importer des images — '+selected,'aia-import-button');
  add.onclick=()=>{
   const topic=selected==='Famille'?'La famille'
    :topics.find(t=>normalized(t.replace(/^(?:La |Le |Les |L’|L')/i,''))===normalized(selected))||'';
   request={category,letter,topic,subtheme:selected};
   replaceId=null;picker.multiple=true;picker.click();
  };
  wrap.append(add);
 }else{
  const info=document.createElement('p');info.className='muted';
  info.textContent='Appuie sur + Ajouter pour créer ton premier sous-thème sous '+letter+'.';
  wrap.append(info);
 }
 area.querySelector('p.muted')?.remove();
 area.append(wrap);
 if(selected){
  const matches=items.filter(item=>existingSubtheme(item,letter)===selected);
  if(matches.length)area.append(gallery(matches,category,letter));
 }
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
      topic:target.topic,subtheme:target.subtheme||'',placements:[{category:target.category,letter:target.letter}]};
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
 area.append(heading,gallery(matches,'','',theme));
});
window.addEventListener('pagehide',()=>{
 closeImage();records.forEach(discard);db?.close();
},{once:true});
(async()=>{
 try{
  db=await openDatabase();
  const stored=await operation('readonly',store=>store.getAll());
  const savedSubthemes=await operation('readonly',store=>store.getAll(),extraStore);
  for(const item of savedSubthemes){if(item?.name&&item?.category&&item?.letter)customSubthemes.push(item)}
  for(const raw of stored){
   if(raw&&raw.blob instanceof Blob&&Array.isArray(raw.placements))records.push(makeRecord(raw));
  }
 }catch(error){console.error('AIA IndexedDB : ',error);db=null}
 finally{ready=true;refresh()}
})();
})();
