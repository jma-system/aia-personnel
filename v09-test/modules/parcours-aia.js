/* AIA V09-test : parcours article -> format -> création, et lecture/commentaires sans PDF. */
(() => {
  'use strict';
  const subject=document.getElementById('subject');
  const home=document.getElementById('home');
  const viewer=document.getElementById('viewer');
  if(!subject||!home||!viewer)return;

  // Récapitulatif du choix : toujours visible avant de générer.
  const choice=document.createElement('div');
  choice.id='aia-choice-confirmation';
  choice.setAttribute('role','status');
  choice.style.cssText='margin:10px 0;padding:12px;border:1px solid #45627f;border-radius:10px;background:transparent;display:none;line-height:1.5';
  subject.after(choice);
  function paintChoice(){
    const title=subject.value.trim();
    choice.replaceChildren();
    choice.style.display=title?'block':'none';
    if(!title)return;
    const heading=document.createElement('strong');
    heading.textContent='Ton article ou sujet sélectionné :';
    const name=document.createElement('div');
    name.textContent=title;
    name.style.cssText='margin:6px 0;font-weight:600';
    const meta=document.createElement('small');
    meta.textContent=(window.publication||publication)+' · Format : '+(window.format||format)+' — vérifie avant Création';
    choice.append(heading,name,meta);
  }
  subject.addEventListener('input',paintChoice);
  for(const id of ['f-Tract','f-Fiche','f-Étude','tg','cvm']){
    document.getElementById(id)?.addEventListener('click',()=>queueMicrotask(paintChoice));
  }

  // Cocher un article TG le choisit immédiatement, sans alimenter deux fois la file.
  document.addEventListener('change',event=>{
    const target=event.target;
    if(!(target instanceof HTMLInputElement)||target.type!=='checkbox'||!target.checked)return;
    const dialog=target.closest('#aia-tg-dialog');
    if(!dialog)return;
    const title=target.closest('label')?.textContent?.trim();
    if(!title)return;
    setPublication('TG');
    subject.value=title;
    paintChoice();
    dialog.close();
    message('Article TG sélectionné. Vérifie le titre et choisis ton format.');
  });

  // Après sélection multiple CVM, afficher le premier sujet choisi.
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');
    const dialog=button?.closest('dialog[aria-label="Programme CVM"]');
    if(!dialog||button.textContent.trim()!=='Enregistrer les sujets cochés')return;
    const chosen=dialog.querySelector('input:checked')?.closest('label')?.textContent?.trim();
    if(chosen){
      subject.value=chosen;
      paintChoice();
    }
  });

  // Les documents déjà enregistrés restent consultables sans exporter de PDF.
  const noteTitle=document.createElement('label');
  noteTitle.textContent='Mon commentaire personnel (facultatif)';
  noteTitle.setAttribute('for','aia-doc-comment');
  const note=document.createElement('textarea');
  note.id='aia-doc-comment';
  note.rows=4;
  note.style.minHeight='95px';
  note.placeholder='Ajoute tes réflexions ou ce que tu souhaites approfondir…';
  const saveNote=document.createElement('button');
  saveNote.type='button';
  saveNote.textContent='Enregistrer le commentaire';
  saveNote.className='primary';
  const section=document.createElement('div');
  section.className='no-print';
  section.style.marginTop='16px';
  section.append(noteTitle,note,saveNote);
  document.getElementById('docBody')?.after(section);
  function refreshNote(){
    const documentActuel=docs[current];
    note.value=documentActuel?.commentaire||'';
    note.disabled=!documentActuel;
    saveNote.disabled=!documentActuel;
  }
  saveNote.addEventListener('click',()=>{
    const doc=docs[current];
    if(!doc)return;
    const previous=doc.commentaire;
    doc.commentaire=note.value;
    if(!persist()){doc.commentaire=previous;return;}
    message('Commentaire enregistré. Aucun PDF créé.');
  });
  const regenerate=document.createElement('button');
  regenerate.type='button';
  regenerate.textContent='Retravailler avec l’IA';
  regenerate.addEventListener('click',()=>{
    const doc=docs[current];
    if(!doc)return;
    const text=[doc.body,doc.commentaire ? 'Mes commentaires :\n'+doc.commentaire : ''].filter(Boolean).join('\n\n');
    window.AIAEngine?.openDraft({
      publication:doc.publication==='TG'?'TG':'CVM',
      subject:doc.title,
      format:doc.format||'Fiche',
      date:doc.date||''
    },text);
    message('La fiche originale reste inchangée. Tu peux créer une nouvelle version.');
  });
  viewer.querySelector('.actions')?.prepend(regenerate);
  const originalShow=window.show;
  window.show=function(id){
    originalShow(id);
    if(id==='viewer')refreshNote();
  };
  const libraryButton=home.querySelector('.aia-test-library');
  if(libraryButton)libraryButton.textContent='Mes fiches AIA';
  const libraryInfo=document.querySelector('#library > .muted');
  if(libraryInfo)libraryInfo.textContent='Appuie sur le titre pour ouvrir, corriger ou commenter. Le PDF reste facultatif.';
  paintChoice();
})();