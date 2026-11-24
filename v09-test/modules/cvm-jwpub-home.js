/* Intégration du lecteur CVM JWPUB dans l'accueil AIA Test.
   Le lecteur reste isolé : aucune modification du stockage ou de la V09 stable. */
(()=>{
 'use strict';
 const home=document.getElementById('home');
 const cvm=document.getElementById('cvm');
 const tg=document.getElementById('tg');
 if(!home||!cvm||!tg)return;
 const section=document.createElement('section');
 section.id='aia-cvm-jwpub-home';
 section.style.cssText='margin:14px 0 0;width:100%';
 const heading=document.createElement('h2');
 heading.textContent='Programme CVM — Choisir une semaine';
 heading.style.cssText='font-size:18px;margin:0 0 8px';
 const hint=document.createElement('p');
 hint.textContent='Sélectionne ton fichier JWPUB original. Les semaines et les sujets s’affichent ici.';
 hint.style.cssText='font-size:13px;line-height:1.45;color:#53657a;margin:0 0 10px';
 const frame=document.createElement('iframe');
 frame.title='Sélection des semaines et des sujets CVM JWPUB';
 frame.src='./test-cvm-jwpub.html?embedded=2';
 frame.loading='lazy';
 frame.style.cssText='display:block;width:100%;height:75vh;min-height:620px;border:1px solid #c9d9e8;border-radius:12px;background:#f3f6fa';
 section.append(frame);
 const workflow=home.querySelector('.aia-workflow');
 const quick=home.querySelector('.aia-search-panel');
 if(workflow)workflow.before(section);else if(quick)quick.before(section);else home.append(section);
 // Neutraliser les anciens composants CVM même si un module les recrée après chargement.
 function removeLegacy(){
  document.querySelectorAll('button').forEach(b=>{
   if(/Programme CVM\\s*[·•]\\s*choisir les sujets/i.test(b.textContent.trim()))b.remove();
  });
  document.querySelectorAll('dialog[aria-label="Programme CVM"]').forEach(d=>{if(d.open)d.close();d.remove();});
 }
 const observer=new MutationObserver(()=>removeLegacy());
 observer.observe(document.body,{childList:true,subtree:true});
 const oldTrigger=[...document.querySelectorAll('button')].find(b=>/Programme CVM\s*[·•]\s*choisir les sujets/i.test(b.textContent.trim()));
 // L'ancien bouton CVM se trouve hors de #home, juste après la rangée des publications.
 // Le masquer avant toute interaction évite l'ouverture du dialogue obsolète.
 if(oldTrigger){oldTrigger.hidden=true;oldTrigger.style.setProperty('display','none','important');oldTrigger.remove();}
 removeLegacy();
 function sync(){
  const active=cvm.classList.contains('selected');
  document.querySelectorAll('dialog[aria-label="Programme CVM"]').forEach(d=>{if(d.open)d.close();d.remove();});
  document.querySelectorAll('button').forEach(b=>{if(/Programme CVM\s*[·•]\s*choisir les sujets/i.test(b.textContent.trim()))b.remove();});
  section.hidden=!active;
  if(workflow)workflow.style.display=active?'none':'';
  if(oldTrigger){oldTrigger.remove();}
 }
 cvm.addEventListener('click',()=>queueMicrotask(sync));
 tg.addEventListener('click',()=>queueMicrotask(sync));
 sync();
})();