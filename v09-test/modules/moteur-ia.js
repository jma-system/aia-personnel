/* AIA V09-test — Passerelle ChatGPT gratuite pour l'application.
   Pas d'API ni de clé dans le navigateur. L'utilisateur transmet le sujet et
   récupère sa réponse lui-même; aucune génération autonome n'est simulée. */
(()=>{
'use strict';
if(typeof window.createFromQueue!=='function'||!document.querySelector('main'))return;
const root=document.createElement('section');root.id='assistantBridge';root.className='card hidden';
root.innerHTML='<h2>Assistant de rédaction</h2><p class="muted">Sans serveur IA : tu peux préparer ta demande pour ChatGPT puis importer la réponse. Rien n’est envoyé automatiquement.</p><p id="bridgeSubject"></p><label for="bridgeSource">Extrait ou notes de la publication (facultatif)</label><textarea id="bridgeSource" placeholder="Ajoute ici le texte que tu souhaites résumer. Sans texte source, la rédaction devra rester générale et signaler les informations à vérifier."></textarea><div class="actions"><button type="button" id="bridgeCopy" class="primary">Copier la demande</button><button type="button" id="bridgeOpen">Ouvrir ChatGPT</button></div><label for="bridgeResult">Réponse obtenue dans ChatGPT</label><textarea id="bridgeResult" placeholder="Colle ici la réponse rédigée par ChatGPT…"></textarea><div class="actions"><button type="button" id="bridgeRead" class="primary">Lire et corriger la fiche</button></div>';
document.querySelector('main').append(root);
const el=id=>document.getElementById(id);
let item=null;
function draftPrompt(){
 const source=el('bridgeSource').value.trim();
 const questions=item.publication==='TG'?'Ajoute 3 ou 4 questions de révision avec réponses naturelles.':'';
 return ['Tu prépares une fiche personnelle AIA en français naturel (/HUMAN).',
 'Publication : '+item.publication,'Sujet : '+item.subject,'Format : '+item.format,'Date : '+item.date,
 'Rédige une '+item.format.toLowerCase()+' claire, structurée, chaleureuse et utile pour une révision personnelle.',
 questions,
 'Important : n’invente aucune citation, référence biblique, question officielle ni contenu d’article absent de la source.',
 'Si la source est insuffisante, indique honnêtement ce qui reste à vérifier. N’affirme pas avoir consulté jw.org.',
 source?'TEXTE FOURNI PAR MOI :\n'+source:'Aucun texte source fourni. Ne prétends pas résumer fidèlement un article non communiqué.',
 'Retourne seulement le texte de la fiche, prêt à relire et corriger.'
 ].filter(Boolean).join('\n\n');
}
async function copyRequest(){
 const txt=draftPrompt();
 try{await navigator.clipboard.writeText(txt);message('Demande copiée. Ouvre ChatGPT et colle-la.')}
 catch(e){let t=el('bridgeFallback');if(!t){t=document.createElement('textarea');t.id='bridgeFallback';t.setAttribute('aria-label','Demande à copier');t.readOnly=true;el('bridgeCopy').after(t)}t.value=txt;t.focus();t.select();message('Copie automatique indisponible : copie la demande sélectionnée.')}
}
el('bridgeCopy').onclick=copyRequest;
el('bridgeOpen').onclick=()=>window.open('https://chatgpt.com/','_blank','noopener,noreferrer');

el('bridgeRead').onclick=()=>{
 const result=el('bridgeResult').value.trim();
 if(!result)return message('Colle d’abord le texte de la fiche.');
 if(!item||!window.AIAPreview?.open(item,result))return message('La lecture est indisponible; ta réponse reste ici.');
 // La sélection reste en attente tant que le brouillon n'a pas été sauvegardé.
 message('Fiche prête à relire. Aucun PDF automatique.');
};
window.addEventListener('aia:fiche-saved',event=>{
 const saved=event.detail?.item;
 if(!saved)return;
 // La page de lecture reçoit une copie du sujet : comparer ses champs,
 // et non les références JavaScript (sinon la file ne diminue jamais).
 const i=queue.findIndex(x=>x.publication===saved.publication &&
   x.format===saved.format && x.subject===saved.subject && x.date===saved.date);
 if(i>=0){queue.splice(i,1);try{localStorage.setItem(QKEY,JSON.stringify(queue))}catch(e){}queueStatus()}
 if(item===saved)item=null;
});
const previousShow=window.show;
window.show=function(id){previousShow(id);root.classList.toggle('hidden',id!=='assistantBridge')};
window.createFromQueue=function(){
 if(!Array.isArray(queue)||!queue.length)return message('Enregistre d’abord un sujet.');
 item=queue[0];
 el('bridgeSubject').textContent=[item.publication,item.subject,item.format].filter(Boolean).join(' • ');
 el('bridgeSource').value='';el('bridgeResult').value='';
 show('assistantBridge');
};
})();