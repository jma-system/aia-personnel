/* AIA — galerie de fiches, V09-test uniquement.
   Import d'images depuis les photos, classement par onglet/lettre,
   association facultative à un thème, aperçu plein écran.
   AUCUN stockage persistant, aucune transmission serveur. */
(()=>{
'use strict';
const section=document.getElementById('indexPanel');
const content=section?.querySelector('.aia-index-content');
if(!section||!content)return;
const topics=['L’avenir','La famille','Dieu','La prière','Jésus','Le Royaume de Dieu','Les souffrances','La mort','La religion','Actualité'];
const allowed=new Set(['image/png','image/jpeg','image/webp']);
const records=[];
let destination=null,previousFocus=null;
const picker=document.createElement('input');
picker.type='file';picker.accept='image/png,image/jpeg,image/webp';picker.multiple=true;picker.hidden=true;
section.append(picker);
const viewer=document.createElement('div');
viewer.className='aia-photo-viewer';viewer.hidden=true;viewer.setAttribute('role','dialog');
viewer.setAttribute('aria-modal','true');viewer.setAttribute('aria-label','Fiche en grand');
const close=document.createElement('button');close.type='button';close.className='aia-photo-close';
close.textContent='×';close.setAttribute('aria-label','Fermer la fiche');
const image=document.createElement('img');image.alt='Fiche sélectionnée';
viewer.append(close,image);document.body.append(viewer);
function showPhoto(record){
 previousFocus=document.activeElement;
 image.src=record.url;image.alt='Fiche '+record.label;
 viewer.hidden=false;document.body.style.overflow='hidden';close.focus();
}
function hidePhoto(){
 viewer.hidden=true;image.removeAttribute('src');document.body.style.overflow='';
 if(previousFocus?.isConnected)previousFocus.focus();
 previousFocus=null;
}
close.addEventListener('click',hidePhoto);
viewer.addEventListener('click',e=>{if(e.target===viewer)hidePhoto()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!viewer.hidden)hidePhoto()});
function cleanLabel(name){
 return name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim()||'Fiche';
}
function thumb(record){
 const button=document.createElement('button');button.type='button';button.className='aia-gallery-card';
 button.setAttribute('aria-label','Afficher '+record.label+' en grand');
 const img=document.createElement('img');img.src=record.url;img.alt='';
 const caption=document.createElement('span');caption.textContent=record.label;
 button.append(img,caption);button.onclick=()=>showPhoto(record);
 return button;
}
function gallery(matches){
 const grid=document.createElement('div');grid.className='aia-gallery-grid';
 matches.forEach(item=>grid.append(thumb(item)));
 return grid;
}
function deleteRecord(item){
 const index=records.indexOf(item);
 if(index!==-1){records.splice(index,1);URL.revokeObjectURL(item.url)}
 section.dispatchEvent(new Event('aia:refresh-index'));
}
function renderCategory(category,letter){
 if(!['TRACTS','FICHES'].includes(category))return;
 // Sélection explicite d'une lettre avant import.
 if(!letter)return;
 const selection=document.createElement('div');selection.className='aia-gallery-controls';
 const label=document.createElement('label');label.textContent='Thème associé (facultatif)';
 label.className='aia-gallery-label';
 const select=document.createElement('select');select.className='aia-gallery-select';
 const none=document.createElement('option');none.value='';none.textContent='Aucun thème';select.append(none);
 topics.forEach(topic=>{const option=document.createElement('option');option.value=topic;option.textContent=topic;select.append(option)});
 label.append(select);
 const add=document.createElement('button');add.type='button';add.className='aia-import-button';
 add.textContent='Importer des images sous '+letter;
 add.addEventListener('click',()=>{
  destination={category,letter,topic:select.value};
  picker.click();
 });
 selection.append(add,label);content.append(selection);
 const matches=records.filter(item=>item.category===category&&item.letter===letter);
 content.querySelector('p.muted')?.remove();
 if(matches.length){
  const count=document.createElement('p');count.className='aia-gallery-count';
  count.textContent=matches.length+' fiche'+(matches.length>1?'s':'');content.append(count);
  content.append(gallery(matches));
  const remove=document.createElement('button');remove.type='button';remove.className='aia-gallery-remove';
  remove.textContent='Retirer une image (test)';
  remove.addEventListener('click',()=>{
   const list=content.querySelector('.aia-gallery-delete-list');
   if(list){list.remove();return}
   const ul=document.createElement('div');ul.className='aia-gallery-delete-list';
   matches.forEach(item=>{
    const btn=document.createElement('button');btn.type='button';btn.textContent='Retirer : '+item.label;
    btn.addEventListener('click',()=>deleteRecord(item));ul.append(btn);
   });
   remove.after(ul);
  });
  content.append(remove);
 }
}
picker.addEventListener('change',()=>{
 const files=Array.from(picker.files||[]);
 const dest=destination;
 picker.value='';
 if(!dest||!files.length)return;
 let invalid=0;
 for(const file of files){
  if(!allowed.has(file.type)||file.size>15*1024*1024){invalid++;continue}
  records.push({
   url:URL.createObjectURL(file),label:cleanLabel(file.name),
   category:dest.category,letter:dest.letter,topic:dest.topic
  });
 }
 destination=null;
 section.dispatchEvent(new Event('aia:refresh-index'));
 if(invalid)alert(invalid+' fichier(s) ignoré(s) : PNG, JPG ou WEBP de 15 Mo maximum.');
});
section.addEventListener('aia:index-render',e=>{
 const {category,letter}=e.detail||{};
 if(category==='THÈMES'){
  // Chaque vignette de thème peut montrer une image liée.
  for(const tile of content.querySelectorAll('.aia-index-tile')){
   const name=tile.querySelector('strong')?.textContent;
   const item=records.find(record=>record.topic===name);
   if(!item)continue;
   const pic=tile.querySelector('.aia-index-placeholder');
   if(pic){
    const img=document.createElement('img');img.src=item.url;img.alt='';
    img.className='aia-family-thumb';pic.replaceWith(img);
   }
  }
  return;
 }
 renderCategory(category,letter);
});
section.addEventListener('aia:theme-select',e=>{
 const topic=e.detail?.theme;
 if(!topic||!topics.includes(topic))return;
 const matches=records.filter(item=>item.topic===topic);
 if(!matches.length)return; // conserver l'écran vide prévu pour les thèmes non renseignés
 e.preventDefault();
 content.replaceChildren();
 const heading=document.createElement('h3');heading.textContent=topic;
 const back=document.createElement('button');back.type='button';back.className='aia-gallery-back';
 back.textContent='Retour aux thèmes';back.onclick=()=>section.dispatchEvent(new Event('aia:refresh-index'));
 content.append(heading,back,gallery(matches));
});
window.addEventListener('pagehide',()=>{
 hidePhoto();
 records.forEach(item=>URL.revokeObjectURL(item.url));
},{once:true});
})();
