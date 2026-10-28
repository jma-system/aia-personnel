/* AIA V09 test: navigation par historique d'écrans, sans toucher aux fiches. */
(() => {
  'use strict';
  const pages=['home','editor','library','viewer','exportPanel','desk'];
  const originalShow=window.show;
  if(typeof originalShow!=='function') return;
  let active=pages.find(id=>!document.getElementById(id)?.classList.contains('hidden'))||'home';
  const history=[];
  function renderButtons(){
    for(const id of pages.filter(x=>x!=='home')){
      const section=document.getElementById(id);
      if(!section)continue;
      let bar=section.querySelector('.aia-navigation');
      if(!bar){
        bar=document.createElement('div');bar.className='aia-navigation no-print';
        bar.style.cssText='display:flex;gap:9px;flex-wrap:wrap;margin:0 0 14px';
        const back=document.createElement('button');back.type='button';back.textContent='← Retour';back.dataset.aiaBack='1';
        const home=document.createElement('button');home.type='button';home.textContent='⌂ Accueil';home.dataset.aiaHome='1';
        back.addEventListener('click',()=>goBack());
        home.addEventListener('click',()=>goHome());
        bar.append(back,home);section.prepend(bar);
      }
      bar.querySelector('[data-aia-back]').disabled=!history.length && active===id;
    }
  }
  function goHome(){history.length=0;active='home';originalShow('home');renderButtons()}
  function goBack(){
    const target=history.pop()||'home';
    active=target;originalShow(target);
    if(target==='viewer'&&typeof window.renderViewer==='function')window.renderViewer();
    if(target==='library'&&typeof window.openLibrary==='function'){
      // Refresh list without recording a second navigation step.
      window.openLibrary();
    }
    renderButtons();
  }
  window.show=function(id){
    if(!pages.includes(id))return originalShow(id);
    if(id!==active){history.push(active);if(history.length>40)history.shift();}
    active=id;originalShow(id);renderButtons();
  };
  // Ancien bouton Accueil : même comportement, historique remis à zéro.
  window.showHome=goHome;
  // Les anciens boutons « Retour » deviennent de vrais retours.
  for(const sectionId of ['editor','exportPanel']){
    const section=document.getElementById(sectionId);
    const buttons=section?.querySelectorAll('.actions button')||[];
    for(const button of buttons){
      if(button.textContent.trim()!=='Retour')continue;
      button.onclick=goBack;
    }
  }
  renderButtons();
})();
