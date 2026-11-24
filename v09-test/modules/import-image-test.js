/* AIA v09-test : importer une fiche via TRACTS ou FICHES > F.
   THÈMES > La famille ouvre directement l'image ; sans stockage persistant. */
(()=>{
'use strict';
const section=document.getElementById('indexPanel');
const content=section?.querySelector('.aia-index-content');
if(!section||!content)return;
const filename='La famille';
const allowed=['image/png','image/jpeg','image/webp'];
const groups=new Set();
let photoUrl=null;
let importGroup='TRACTS';
const picker=document.createElement('input');
picker.type='file';picker.accept='image/png,image/jpeg,image/webp';picker.hidden=true;
section.append(picker);
const viewer=document.createElement('div');
viewer.className='aia-photo-viewer';viewer.hidden=true;
viewer.setAttribute('role','dialog');viewer.setAttribute('aria-modal','true');
viewer.setAttribute('aria-label','Fiche La famille');
const close=document.createElement('button');
close.type='button';close.className='aia-photo-close';close.textContent='×';
close.setAttribute('aria-label','Fermer la fiche');
const photo=document.createElement('img');photo.alt='La famille';
viewer.append(close,photo);document.body.append(viewer);
function showPhoto(){
 if(!photoUrl)return;
 photo.src=photoUrl;viewer.hidden=false;
 document.body.style.overflow='hidden';close.focus();
}
function hidePhoto(){
 viewer.hidden=true;photo.removeAttribute('src');
 document.body.style.overflow='';
}
close.onclick=hidePhoto;
viewer.addEventListener('click',e=>{if(e.target===viewer)hidePhoto()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!viewer.hidden)hidePhoto()});
function entry(label){
 const btn=document.createElement('button');
 btn.type='button';btn.className='aia-family-entry';
 btn.setAttribute('aria-label','Afficher la fiche La famille');
 const thumb=document.createElement('img');thumb.src=photoUrl;thumb.alt='';
 const text=document.createElement('span');text.textContent=label;
 btn.append(thumb,text);btn.onclick=showPhoto;return btn;
}
function clear(){
 hidePhoto();if(photoUrl)URL.revokeObjectURL(photoUrl);
 photoUrl=null;groups.clear();picker.value='';
 section.dispatchEvent(new Event('aia:refresh-index'));
}
picker.addEventListener('change',()=>{
 const file=picker.files?.[0];if(!file)return;
 if(!allowed.includes(file.type)||file.size>15*1024*1024){
  alert('Choisis une image PNG, JPG ou WEBP de 15 Mo maximum.');
  picker.value='';return;
 }
 if(photoUrl)URL.revokeObjectURL(photoUrl);
 photoUrl=URL.createObjectURL(file);
 groups.add(importGroup);
 section.dispatchEvent(new Event('aia:refresh-index'));
});
section.addEventListener('aia:index-render',e=>{
 const {category,letter}=e.detail||{};
 if(category==='THÈMES'){
  if(photoUrl&&(!letter||letter==='F')){
   const tile=[...content.querySelectorAll('.aia-index-tile')].find(el=>el.querySelector('strong')?.textContent===filename);
   const pic=tile?.querySelector('.aia-index-placeholder');
   if(pic){
    const thumb=document.createElement('img');thumb.src=photoUrl;thumb.alt='';
    thumb.className='aia-family-thumb';pic.replaceWith(thumb);
   }
  }
  return;
 }
 if(!['TRACTS','FICHES'].includes(category)||letter!=='F')return;
 content.querySelector('p.muted')?.remove();
 const importBtn=document.createElement('button');
 importBtn.type='button';importBtn.className='aia-import-button';
 importBtn.textContent='Importer une fiche sous F';
 importBtn.onclick=()=>{importGroup=category;picker.click()};
 content.append(importBtn);
 if(photoUrl&&groups.has(category)){
  content.append(entry(filename));
  const remove=document.createElement('button');
  remove.type='button';remove.className='aia-family-remove';remove.textContent='Retirer la fiche (test)';
  remove.onclick=clear;content.append(remove);
 }
});
section.addEventListener('aia:theme-select',e=>{
 if(e.detail?.theme!==filename)return;
 e.preventDefault();
 if(photoUrl){showPhoto();return}
 content.replaceChildren();
 const title=document.createElement('h3');title.textContent=filename;
 const message=document.createElement('p');message.className='muted';
 message.textContent='Aucune image importée. Pour ajouter cette fiche : TRACTS ou FICHES, puis lettre F.';
 const back=document.createElement('button');back.type='button';
 back.textContent='Retour aux thèmes';
 back.onclick=()=>section.dispatchEvent(new Event('aia:refresh-index'));
 content.append(title,message,back);
});
window.addEventListener('pagehide',()=>{if(photoUrl)URL.revokeObjectURL(photoUrl)},{once:true});
})();
