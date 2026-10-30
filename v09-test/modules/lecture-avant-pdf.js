/* AIA — Lecture du résultat avant enregistrement ou export PDF.
   Le brouillon généré reste en mémoire jusqu'au choix de l'utilisateur. */
(()=>{
 'use strict';
 let pending=null;
 const panel=document.createElement('section');
 panel.id='preview';
 panel.className='card hidden';
 panel.dataset.aiaPage='preview';
 const title=document.createElement('h2');
 title.textContent='Lecture avant validation';
 const info=document.createElement('p');
 info.className='muted';
 const body=document.createElement('div');
 body.className='document';
 body.style.cssText='margin:14px 0;white-space:pre-wrap';
 const hint=document.createElement('p');
 hint.className='muted';
 hint.textContent='Relis tranquillement ce texte. Tu peux le corriger ou le conserver comme brouillon. Aucun PDF n’est créé automatiquement.';
 const navigation=document.createElement('div');
 navigation.className='actions no-print';
 const back=document.createElement('button');back.textContent='← Retour';
 const home=document.createElement('button');home.textContent='⌂ Accueil';
 navigation.append(back,home);
 const buttons=document.createElement('div');
 buttons.className='actions';
 const correct=document.createElement('button');
 correct.textContent='Corriger';
 const draft=document.createElement('button');
 draft.textContent='Garder en brouillon';
 const approve=document.createElement('button');
 approve.className='primary';
 approve.textContent='Valider';
 buttons.append(correct,draft,approve);
 panel.append(navigation,title,info,body,hint,buttons);
 back.onclick=()=>show('home');
 home.onclick=()=>showHome();
 document.querySelector('main')?.append(panel);
 function prepareEditor(){
  if(!pending)return false;
  editId=null;
  byId('editHeading').textContent='Corriger avant validation';
  byId('textTitle').value=pending.item.subject;
  byId('textContent').value=pending.text;
  byId('editor').dataset.info=JSON.stringify(pending.item);
  return true;
 }
 function save(validated){
  if(!prepareEditor())return;
  // Réutilise le mécanisme actuel : ne modifie aucune fiche existante.
  saveDraft();
  if(validated && byId('viewer') && !byId('viewer').classList.contains('hidden'))validateCurrent();
  if(!byId('viewer').classList.contains('hidden'))pending=null;
 }
 correct.onclick=()=>{if(prepareEditor())show('editor')};
 draft.onclick=()=>save(false);
 approve.onclick=()=>save(true);
 window.AIAPreview={
  open(item,text){
   if(!item||typeof text!=='string'||!text.trim())return false;
   pending={item:{...item},text};
   title.textContent='Lire : '+(item.subject||'Nouveau document');
   info.textContent=[item.publication,item.format,item.date,'À relire'].filter(Boolean).join(' • ');
   body.textContent=text;
   // show() masque les panneaux historiques ; masque également cette page lors du retour.
   show('preview');
   return true;
  },
  close(){pending=null;panel.classList.add('hidden')}
 };
 const oldShow=window.show;
 window.show=function(id){
  oldShow(id);
  panel.classList.toggle('hidden',id!=='preview');
 };
})();
