/* AIA — bloc de test isolé : sélection et aperçu d'une image Drive/fichiers.
   Aucun stockage ni téléversement ; la prévisualisation disparaît au rechargement. */
(()=>{
'use strict';
const section=document.getElementById('indexPanel');
if(!section)return;
const tabs=section.querySelector('.aia-index-tabs');
if(!tabs)return;
const wrap=document.createElement('div');wrap.className='aia-import-test';wrap.setAttribute('aria-label','Importer une image de fiche pour test');
const button=document.createElement('button');button.type='button';button.textContent='Importer une image (test)';
button.className='aia-import-button';
const input=document.createElement('input');input.type='file';input.accept='image/png,image/jpeg,image/webp,image/gif';input.hidden=true;input.setAttribute('aria-label','Choisir une image sur le téléphone ou Drive');
const status=document.createElement('p');status.className='aia-import-status';status.setAttribute('aria-live','polite');
const preview=document.createElement('div');preview.className='aia-import-preview';preview.hidden=true;
const image=document.createElement('img');image.alt='Aperçu de la fiche importée';image.className='aia-import-image';
const caption=document.createElement('p');caption.className='aia-import-caption';
const close=document.createElement('button');close.type='button';close.textContent='Retirer l’aperçu';
preview.append(image,caption,close);
wrap.append(button,input,status,preview);tabs.after(wrap);
let objectUrl=null;
function clear(){if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null}image.removeAttribute('src');preview.hidden=true;input.value='';status.textContent=''}
button.addEventListener('click',()=>input.click());
close.addEventListener('click',clear);
input.addEventListener('change',()=>{
 const file=input.files&&input.files[0];
 if(!file)return;
 if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)){clear();status.textContent='Format non pris en charge. Choisis une image PNG, JPG ou WEBP.';return}
 if(file.size>15*1024*1024){clear();status.textContent='Image trop volumineuse (maximum 15 Mo).';return}
 if(objectUrl)URL.revokeObjectURL(objectUrl);
 objectUrl=URL.createObjectURL(file);
 image.src=objectUrl;
 caption.textContent=file.name+' — Aperçu temporaire, non enregistré dans AIA.';
 preview.hidden=false;
 status.textContent='Image chargée pour le test. Elle disparaîtra à la fermeture ou au rechargement.';
});
window.addEventListener('pagehide',()=>{if(objectUrl)URL.revokeObjectURL(objectUrl)},{once:true});
})();
