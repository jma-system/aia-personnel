/* AIA — vérification locale de sauvegarde sans restauration. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.AIABackupAudit=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const MAX_ITEMS=1000,MAX_DATA=110*1024*1024;
 function validate(doc){
  const problems=[];
  if(!doc||typeof doc!=='object'||Array.isArray(doc))return {ok:false,problems:['Sauvegarde JSON invalide']};
  if(doc.schema!=='aia-repertoire-export-v1')problems.push('Format de sauvegarde inconnu');
  if(doc.source!=='aia-repertoire-v09-test')problems.push('Origine AIA Test non reconnue');
  if(!Array.isArray(doc.items))problems.push('Liste de fiches absente');
  if(!Array.isArray(doc.subthemes))problems.push('Liste des sous-thèmes absente');
  if(problems.length)return {ok:false,problems};
  if(doc.items.length>MAX_ITEMS)problems.push('Nombre de fiches excessif');
  const ids=new Set(),titles=[];
  for(const [index,item] of doc.items.entries()){
   if(!item||typeof item!=='object'){problems.push('Fiche '+(index+1)+' invalide');continue}
   if(typeof item.id!=='string'||!item.id.trim()||ids.has(item.id))problems.push('Identifiant manquant ou dupliqué : fiche '+(index+1));
   else ids.add(item.id);
   if(typeof item.label!=='string'||!item.label.trim())problems.push('Titre absent : fiche '+(index+1));
   if(typeof item.topic!=='string'||!item.topic.trim())problems.push('Thème absent : fiche '+(index+1));
   if(!Array.isArray(item.placements))problems.push('Classements absents : fiche '+(index+1));
   if(!Array.isArray(item.references))problems.push('Références absentes : fiche '+(index+1));
   if(typeof item.imageData!=='string'||!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(item.imageData))problems.push('Image non reconnue : fiche '+(index+1));
   else if(item.imageData.length>MAX_DATA)problems.push('Image trop volumineuse : fiche '+(index+1));
   titles.push(String(item.label||'Sans titre'));
  }
  return {ok:problems.length===0,problems,count:doc.items.length,titles,subthemes:doc.subthemes.length,exportedAt:doc.exportedAt||null};
 }
 return {validate};
});
