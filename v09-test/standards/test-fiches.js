/* AIA — Contrôles de conformité DOM ; navigateur, sans dépendance.
   Lancer après chargement du template, sur une fiche test. */
(function(global){
'use strict';
function inspect(root){
 const errors=[];
 if(!root){return {ok:false,errors:['Fiche introuvable']};}
 const one=(sel)=>root.querySelector(sel);
 const title=one('.aia-famille-heading');
 const image=one('.aia-famille-image');
 const columns=one('.aia-famille-columns');
 const verses=[...root.querySelectorAll('.aia-famille-verse')];
 const links=[...root.querySelectorAll('.aia-famille-reference')];
 if(!title||!title.textContent.trim())errors.push('Titre absent');
 if(!image||!image.getAttribute('src'))errors.push('Image absente');
 if(!columns||!one('.aia-famille-text'))errors.push('Colonnes image/texte absentes');
 if(!verses.length)errors.push('Encadrés bibliques absents');
 if(!links.length)errors.push('Références bibliques absentes');
 for(const a of links){
   const url=a.getAttribute('href');
   try{const u=new URL(url,location.href);if(u.protocol!=='https:'||!/(^|\\.)jw\\.org$/.test(u.hostname))errors.push('Lien biblique hors jw.org : '+url);}
   catch{errors.push('Lien biblique invalide : '+url);}
 }
 if(image&&image.complete&&image.naturalWidth===0)errors.push('Image non chargée');
 const style=getComputedStyle(root);
 if(!style.fontFamily.toLowerCase().includes('verdana'))errors.push('Police Verdana absente');
 if(root.scrollWidth>root.clientWidth+2)errors.push('Débordement horizontal');
 return {ok:errors.length===0,errors};
}
global.AIAFamilleTest={inspect};
})(window);
