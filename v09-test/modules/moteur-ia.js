/* AIA — Bloc moteur IA facultatif. Tant qu'aucun endpoint n'est configuré, l'ancien éditeur demeure inchangé. */
(()=>{
'use strict';
const ENDPOINT=''; // URL Cloudflare Worker à renseigner après déploiement, suffixe /generate.
if(!ENDPOINT)return;
const original=window.createFromQueue;
if(typeof original!=='function')return;
let busy=false;
window.createFromQueue=async function(){
 if(busy)return;
 if(!Array.isArray(queue)||!queue.length)return message('Enregistre d’abord au moins un sujet.');
 const item=queue[0];
 // Aucun téléchargement des publications : seul le sujet saisi est transmis.
 busy=true;
 const btn=document.querySelector('[onclick="createFromQueue()"]');
 if(btn){btn.disabled=true;btn.setAttribute('aria-busy','true')}
 message('Génération IA en cours…');
 try{
  const response=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...item,sourceText:''}),signal:AbortSignal.timeout(60000)});
  const result=await response.json();
  if(!response.ok||typeof result.text!=='string'||!result.text.trim())throw new Error(result.error||'Réponse IA invalide.');
  // Ne retirer de la file qu'après réussite : aucune fiche perdue en cas d'erreur.
  queue.shift();
  localStorage.setItem(QKEY,JSON.stringify(queue));
  queueStatus();
  editId=null;
  byId('editHeading').textContent='Révision : '+item.publication+' • '+item.format;
  byId('textTitle').value=item.subject;
  byId('textContent').value=result.text;
  byId('editor').dataset.info=JSON.stringify(item);
  show('editor');
  message('Texte IA prêt à être vérifié et corrigé.');
 }catch(e){message('IA indisponible : '+(e.message||'erreur')+'. Sélection conservée.');}
 finally{busy=false;if(btn){btn.disabled=false;btn.removeAttribute('aria-busy')}}
};
})();
