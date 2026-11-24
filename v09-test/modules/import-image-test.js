/* AIA — test d'association d'une image à THÈMES > La famille.
   Import local temporaire uniquement : aucun enregistrement ni téléversement. */
(()=>{
'use strict';
const section=document.getElementById('indexPanel');
if(!section)return;
const content=section.querySelector('.aia-index-content');
if(!content)return;
let photoUrl=null;
const wrap=document.createElement('div');
wrap.className='aia-import-test';
wrap.setAttribute('aria-label','Image du thème La famille');
const button=document.createElement('button');
button.type='button';
button.className='aia-import-button';
button.textContent='Importer la fiche « La famille »';
const input=document.createElement('input');
input.type='file';
input.accept='image/png,image/jpeg,image/webp';
input.hidden=true;
input.setAttribute('aria-label','Choisir la fiche La famille dans les photos');
const status=document.createElement('p');
status.className='aia-import-status';
status.setAttribute('aria-live','polite');
const preview=document.createElement('div');
preview.className='aia-import-preview';
preview.hidden=true;
const image=document.createElement('img');
image.className='aia-import-image';
image.alt='Fiche importée pour le thème La famille';
const caption=document.createElement('p');
caption.className='aia-import-caption';
const remove=document.createElement('button');
remove.type='button';
remove.textContent='Retirer la fiche du thème';
preview.append(image,caption,remove);
wrap.append(button,input,status,preview);
function clear(){
 if(photoUrl){URL.revokeObjectURL(photoUrl);photoUrl=null}
 image.removeAttribute('src');
 preview.hidden=true;
 input.value='';
 status.textContent='La fiche a été retirée de cet aperçu.';
}
button.addEventListener('click',()=>input.click());
remove.addEventListener('click',clear);
input.addEventListener('change',()=>{
 const file=input.files&&input.files[0];
 if(!file)return;
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)){
  status.textContent='Choisis une image PNG, JPG ou WEBP.';input.value='';return;
 }
 if(file.size>15*1024*1024){
  status.textContent='Fichier trop volumineux : maximum 15 Mo.';input.value='';return;
 }
 if(photoUrl)URL.revokeObjectURL(photoUrl);
 photoUrl=URL.createObjectURL(file);
 image.src=photoUrl;
 caption.textContent=file.name+' — associée à « La famille » pour cette session.';
 preview.hidden=false;
 status.textContent='Fiche affichée dans le thème La famille. Elle ne sera pas conservée après rechargement.';
});
section.addEventListener('aia:theme-open',e=>{
 if(e.detail?.theme!=='La famille')return;
 const placeholder=content.querySelector('p.muted');
 if(placeholder&&placeholder.textContent==='Fiche à préparer.')placeholder.remove();
 content.append(wrap);
 status.textContent=photoUrl?'Fiche retrouvée dans le thème La famille pour cette session.':'Sélectionne une image dans les photos de ton téléphone.';
});
window.addEventListener('pagehide',()=>{if(photoUrl)URL.revokeObjectURL(photoUrl)},{once:true});
})();
