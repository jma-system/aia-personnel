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
let db=null,ready=false,request=null,focusBefore=null,replaceId=null,activeTheme=null;
const picker=document.createElement('input');
picker.type='file';picker.accept='image/png,image/jpeg,image/webp';picker.hidden=true;picker.multiple=true;
section.append(picker);
const viewer=document.createElement('div');
viewer.className='aia-photo-viewer';viewer.hidden=true;
viewer.setAttribute('role','dialog');viewer.setAttribute('aria-modal','true');viewer.setAttribute('aria-label','Image agrandie');
const close=document.createElement('button');close.type='button';close.className='aia-photo-close';
close.textContent='×';close.setAttribute('aria-label','Fermer');
const imageFrame=document.createElement('div');imageFrame.className='aia-photo-frame';
const large=document.createElement('img');large.alt='Fiche agrandie';
const verseLink=document.createElement('a');
verseLink.className='aia-verse-hotspot';
verseLink.href='https://www.jw.org/fr/biblioth%C3%A8que/bible/nwt/livres/%C3%89ph%C3%A9siens/5/#v49005028';
verseLink.target='_blank';verseLink.rel='noopener noreferrer';
verseLink.textContent='';verseLink.setAttribute('aria-label','Lire Éphésiens 5:28 sur JW.org');
verseLink.title='Éphésiens 5:28 — ouvrir la Traduction du monde nouveau';
verseLink.hidden=true;
imageFrame.append(large,verseLink);
viewer.append(close,imageFrame);document.body.append(viewer);
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
 // Premier test : zone tactile sur Éphésiens 5:28, 33 de la fiche Famille.
 // Les autres images ne présentent aucune zone cliquable.
 verseLink.hidden=!(item.topic==='La famille'||item.subtheme==='Famille'||/famille/i.test(item.label));
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
function refresh(){
 const theme=activeTheme;
 section.dispatchEvent(new Event('aia:refresh-index'));
 if(theme){activeTheme=theme;renderTheme(theme)}
}
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
 const choose=makeButton('S','aia-gallery-choose');
 choose.setAttribute('aria-label','Sélectionner des images');
 choose.title='Sélectionner des images';
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
  choose.textContent='S';
  choose.setAttribute('aria-label',selectionActive?'Annuler la sélection':'Sélectionner des images');
  choose.title=selectionActive?'Annuler la sélection':'Sélectionner des images';
  choose.setAttribute('aria-pressed',String(selectionActive));
  count.textContent=selectionActive&&selectedIds.size>0?String(selectedIds.size):'';
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
   if(theme)return item.placements.length?{...item,topic:''}:null;
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
 wrap.append(bar,grid);
 update();
 return wrap;
}
// La même ligne de commandes est utilisée dans chaque sous-dossier.
function toolbar(importButton,view){
 const row=document.createElement('div');
 row.className='aia-repertoire-toolbar';
 const controls=view.querySelector('.aia-gallery-selection-bar');
 if(!controls)throw new Error('Barre de sélection manquante');
 row.append(importButton,controls);
 return row;
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
 // Les noms d'origine restent les identifiants : renommer n'altère aucune photo.
 const names=letter==='F'?['Famille','Foi']:[];
 for(const entry of customSubthemes){
  if(entry.category===category&&entry.letter===letter)names.push(entry.source||entry.name);
 }
 for(const item of items)names.push(existingSubtheme(item,letter));
 const unique=[...new Set(names)];
 const named=source=>{
  const entry=customSubthemes.find(e=>e.category===category&&e.letter===letter&&(e.source||e.name)===source);
  return entry?.name||source;
 };
 const previous=selectedSubtheme.get(key);
 const selected=unique.includes(previous)?previous:
  (unique.find(source=>named(source)===previous)||unique[0]||'');
 selectedSubtheme.set(key,selected);
 const wrap=document.createElement('div');wrap.className='aia-gallery-controls';
 const bar=document.createElement('div');
 bar.className='aia-subtheme-strip';
 bar.setAttribute('aria-label','Sous-thèmes sous '+letter);
 for(const name of unique){
  const button=makeButton(named(name),'aia-subtheme-tab');
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
  const current=unique.find(x=>normalized(named(x))===normalized(name));
  if(current){selectedSubtheme.set(key,current);refresh();return}
  const entry={id:category+'|'+letter+'|'+normalized(name),category,letter,source:name,name};
  try{
   await operation('readwrite',store=>store.put(entry),extraStore);
   customSubthemes.push(entry);
   selectedSubtheme.set(key,name);
   refresh();
  }catch(error){alert('Enregistrement impossible : '+(error?.message||'erreur'))}
 };
 bar.append(create);
 const rename=makeButton('✎','aia-subtheme-rename');
 rename.setAttribute('aria-label',selected?'Renommer le sous-thème '+named(selected):'Renommer un sous-thème');
 rename.title=selected?'Renommer « '+named(selected)+' »':'Choisir un sous-thème';
 rename.disabled=!selected;
 rename.onclick=async()=>{
  if(!selected)return;
  const oldLabel=named(selected);
  const answer=prompt('Nouveau nom pour « '+oldLabel+' » :',oldLabel);
  if(answer===null)return;
  const name=answer.trim().replace(/\s+/g,' ').slice(0,45);
  if(!name){alert('Saisis un nom.');return}
  if(!startsWithLetter(name,letter)){
   alert('Le nom doit commencer par '+letter+' pour rester dans cette lettre.');return;
  }
  const collision=unique.find(source=>source!==selected&&normalized(named(source))===normalized(name));
  if(collision){alert('Ce sous-thème existe déjà dans '+category+' sous '+letter+'.');return}
  if(name===oldLabel)return;
  const previousEntry=customSubthemes.find(e=>e.category===category&&e.letter===letter&&(e.source||e.name)===selected);
  const updated=previousEntry?
   {...previousEntry,source:selected,name}:
   {id:'nom|'+category+'|'+letter+'|'+normalized(selected),category,letter,source:selected,name,kind:'renamed'};
  try{
   await operation('readwrite',store=>store.put(updated),extraStore);
   const index=customSubthemes.findIndex(e=>e.id===updated.id);
   if(index>=0)customSubthemes[index]=updated;else customSubthemes.push(updated);
   selectedSubtheme.set(key,selected);
   refresh();
  }catch(error){alert('Impossible de renommer : '+(error?.message||'erreur de stockage'))}
 };
 // Le crayon est désormais dans la ligne du titre TRACTS/FICHES,
 // jamais dans le défilement horizontal des sous-thèmes.
 const heading=area.querySelector(':scope > h3');
 if(heading){
  const headingRow=document.createElement('div');
  headingRow.className='aia-repertoire-header';
  heading.replaceWith(headingRow);
  headingRow.append(heading,rename);
 }
 wrap.append(bar);
 if(selected){
  const add=makeButton('Importer','aia-import-button');
  add.setAttribute('aria-label','Importer des images dans '+named(selected)+' sous '+letter);
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
  const view=gallery(matches,category,letter);
  const importButton=wrap.querySelector('.aia-import-button');
  if(importButton)wrap.append(toolbar(importButton,view));
  area.append(view);
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
    const placements=target.category==='THÈMES'?[]:[{category:target.category,letter:target.letter}];
    const item={id:crypto.randomUUID(),blob:file,label:labelFrom(file.name),
      topic:target.topic||'',subtheme:target.subtheme||'',placements};
    await save(item);
   }else return;
   saved++;
  }catch(error){errors++;console.error('AIA import : ',error)}
 }
 if(errors||invalid)alert(saved+' fiche(s) enregistrée(s). '+invalid+' format(s) ignoré(s), '+errors+' erreur(s) de stockage.');
});
function themeLabel(theme){
 const alias=customSubthemes.find(t=>t.category==='THÈMES'&&t.source===theme);
 return alias?.name||theme;
}
function renderTheme(theme){
 area.replaceChildren();
 const heading=document.createElement('h3');heading.textContent=themeLabel(theme);
 const headingRow=document.createElement('div');headingRow.className='aia-repertoire-header';
 const rename=makeButton('✎','aia-subtheme-rename');
 rename.setAttribute('aria-label','Renommer le thème '+themeLabel(theme));
 rename.title='Renommer « '+themeLabel(theme)+' »';
 rename.onclick=async()=>{
  const current=themeLabel(theme);
  const response=prompt('Nouveau nom pour « '+current+' » :',current);
  if(response===null)return;
  const newName=response.trim().replace(/\s+/g,' ').slice(0,45);
  if(!newName){alert('Saisis un nom.');return}
  const base=theme.replace(/^(?:La |Le |Les |L’|L')/i,'');
  const newBase=newName.replace(/^(?:La |Le |Les |L’|L')/i,'');
  if(!startsWithLetter(newBase,normalized(base).charAt(0))){
   alert('Le thème doit rester classé sous la même lettre.');return;
  }
  if(newName===current)return;
  const collision=topics.some(t=>t!==theme&&normalized(themeLabel(t))===normalized(newName));
  if(collision){alert('Un thème porte déjà ce nom.');return}
  const existing=customSubthemes.find(t=>t.category==='THÈMES'&&t.source===theme);
  const updated=existing?{...existing,name:newName}:{id:'theme-label|'+normalized(theme),category:'THÈMES',letter:'',source:theme,name:newName,kind:'theme-name'};
  try{
   await operation('readwrite',store=>store.put(updated),extraStore);
   const index=customSubthemes.findIndex(t=>t.id===updated.id);
   if(index>=0)customSubthemes[index]=updated;else customSubthemes.push(updated);
   refresh();
  }catch(error){alert('Renommage impossible : '+(error?.message||'erreur'))}
 };
 headingRow.append(heading,rename);
 const items=records.filter(item=>item.topic===theme);
 const view=gallery(items,'','',theme);
 const add=makeButton('Importer','aia-import-button');
 add.setAttribute('aria-label','Importer des images dans le thème '+theme);
 add.onclick=()=>{
  request={category:'THÈMES',letter:'',topic:theme,subtheme:''};
  replaceId=null;picker.multiple=true;picker.click();
 };
 area.append(headingRow,toolbar(add,view),view);
}
section.addEventListener('aia:index-render',e=>{
 activeTheme=null;
 const {category,letter}=e.detail||{};
 if(category==='THÈMES'){
  if(!ready)return;
  for(const tile of area.querySelectorAll('.aia-index-tile')){
   const name=tile.querySelector('strong')?.textContent;
   const item=records.find(r=>r.topic===name);
   const pic=tile.querySelector('.aia-index-placeholder');
   if(item&&pic){const img=document.createElement('img');img.src=item.url;img.alt='';img.className='aia-family-thumb';pic.replaceWith(img)}
   const title=tile.querySelector('strong');
   if(title&&name)title.textContent=themeLabel(name);
  }
  return;
 }
 categoryView(category,letter);
});
section.addEventListener('aia:theme-select',e=>{
 const theme=e.detail?.theme;
 if(!topics.includes(theme))return;
 e.preventDefault();
 activeTheme=theme;
 renderTheme(theme);
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
