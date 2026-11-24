/* AIA v09-test — bloc import ciblé, classement libre et aperçu image seul.
   En mémoire de session uniquement : pas de stockage dans le navigateur. */
(()=>{
'use strict';
const section=document.getElementById('indexPanel');
const content=section?.querySelector('.aia-index-content');
if(!section||!content)return;
let photoUrl=null;
const categories=new Set(['THÈMES']);
const filename='La famille';
const allowed=['image/png','image/jpeg','image/webp'];
const viewer=document.createElement('div');
viewer.className='aia-photo-viewer';
viewer.hidden=true;
viewer.setAttribute('role','dialog');
viewer.setAttribute('aria-modal','true');
viewer.setAttribute('aria-label','Fiche La famille');
const closeViewer=document.createElement('button');
closeViewer.type='button';
closeViewer.className='aia-photo-close';
closeViewer.textContent='×';
closeViewer.setAttribute('aria-label','Fermer la fiche');
const fullImage=document.createElement('img');
fullImage.alt='Fiche La famille';
viewer.append(closeViewer,fullImage);
document.body.append(viewer);
function openImage(){
 if(!photoUrl)return;
 fullImage.src=photoUrl;
 viewer.hidden=false;
 document.body.style.overflow='hidden';
 closeViewer.focus();
}
function hideImage(){
 viewer.hidden=true;
 fullImage.removeAttribute('src');
 document.body.style.overflow='';
}
closeViewer.addEventListener('click',hideImage);
viewer.addEventListener('click',e=>{if(e.target===viewer)hideImage()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!viewer.hidden)hideImage()});
function removeImage(){
 hideImage();
 if(photoUrl){URL.revokeObjectURL(photoUrl);photoUrl=null}
 const preview=content.querySelector('.aia-family-preview');
 if(preview)preview.remove();
}
function makeTile(label,container){
 const tile=document.createElement('button');
 tile.type='button';
 tile.className='aia-family-entry';
 tile.setAttribute('aria-label','Ouvrir la fiche La famille');
 const img=document.createElement('img');
 img.src=photoUrl;img.alt='';
 const span=document.createElement('span');span.textContent=label;
 tile.append(img,span);
 tile.addEventListener('click',openImage);
 container.append(tile);
 return tile;
}
function showInCategory(category,letter){
 if(!photoUrl||!categories.has(category)||letter&&letter!=='F')return;
 if(category==='THÈMES'){
  const tile=[...content.querySelectorAll('.aia-index-tile')].find(el=>el.querySelector('strong')?.textContent===filename);
  if(tile){
   const pic=tile.querySelector('.aia-index-placeholder');
   if(pic){const img=document.createElement('img');img.src=photoUrl;img.alt='';img.className='aia-family-thumb';pic.replaceWith(img)}
  }
 }else{
  content.querySelector('p.muted')?.remove();
  makeTile(filename,content);
 }
}
section.addEventListener('aia:index-render',e=>showInCategory(e.detail.category,e.detail.letter));
section.addEventListener('aia:theme-open',e=>{
 if(e.detail?.theme!==filename)return;
 content.querySelector('p.muted')?.remove();
 const form=document.createElement('div');form.className='aia-family-form';
 const fileButton=document.createElement('button');fileButton.type='button';fileButton.textContent='Importer la fiche La famille';fileButton.className='aia-import-button';
 const input=document.createElement('input');input.type='file';input.accept='image/png,image/jpeg,image/webp';input.hidden=true;
 const heading=document.createElement('p');heading.className='aia-family-label';heading.textContent='Classer dans :';
 const choices=document.createElement('div');choices.className='aia-family-choices';
 for(const category of ['TRACTS','FICHES','THÈMES']){
  const label=document.createElement('label');label.className='aia-family-choice';
  const check=document.createElement('input');check.type='checkbox';check.checked=categories.has(category);
  check.addEventListener('change',()=>{if(check.checked)categories.add(category);else categories.delete(category)});
  label.append(check,document.createTextNode(' '+category));choices.append(label);
 }
 const preview=document.createElement('div');preview.className='aia-family-preview';
 function drawPreview(){
  preview.replaceChildren();
  if(!photoUrl)return;
  makeTile('Voir la fiche',preview);
  const remove=document.createElement('button');remove.type='button';remove.textContent='Retirer';remove.className='aia-family-remove';
  remove.addEventListener('click',()=>{removeImage();input.value=''});
  preview.append(remove);
 }
 fileButton.addEventListener('click',()=>input.click());
 input.addEventListener('change',()=>{
  const file=input.files?.[0];if(!file)return;
  if(!allowed.includes(file.type)||file.size>15*1024*1024){
   alert('Choisis une image PNG, JPG ou WEBP de 15 Mo maximum.');input.value='';return;
  }
  if(photoUrl)URL.revokeObjectURL(photoUrl);
  photoUrl=URL.createObjectURL(file);
  drawPreview();
 });
 form.append(fileButton,input,heading,choices,preview);
 content.append(form);
 drawPreview();
});
window.addEventListener('pagehide',()=>{if(photoUrl)URL.revokeObjectURL(photoUrl)},{once:true});
})();
