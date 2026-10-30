/* AIA V09-test — Navigation unique de tous les écrans, sans toucher aux fiches. */
(()=>{
'use strict';
const ids=['home','editor','library','viewer','exportPanel','desk','preview','assistantBridge'];
const baseShow=window.show;
if(typeof baseShow!=='function')return;
let active='home';
let backStack=[],forwardStack=[],navigating=false;
const get=id=>document.getElementById(id);
function enabled(id){return ids.includes(id)&&!!get(id)}
function paint(){
 for(const id of ids){
  const section=get(id);if(!section)continue;
  section.classList.toggle('hidden',id!==active);
  let bar=section.querySelector(':scope > .aia-navigation');
  if(!bar){
   bar=document.createElement('div');bar.className='aia-navigation no-print';
   bar.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 14px';
   const prev=document.createElement('button');prev.type='button';prev.dataset.aiaPrev='1';prev.textContent='〈 Précédent';prev.onclick=goBack;
   const next=document.createElement('button');next.type='button';next.dataset.aiaNext='1';next.textContent='Suivant 〉';next.onclick=goForward;
   bar.append(prev,next);
   if(id!=='home'){
    const home=document.createElement('button');home.type='button';home.dataset.aiaHome='1';home.textContent='⌂ Accueil';home.onclick=goHome;bar.append(home);
   }
   section.prepend(bar);
  }
  bar.querySelector('[data-aia-prev]').disabled=backStack.length===0;
  bar.querySelector('[data-aia-next]').disabled=forwardStack.length===0;
 }
}
function showTarget(id){
 navigating=true;
 try{baseShow(id)}finally{navigating=false}
 active=id;
 paint();
 window.scrollTo(0,0);
}
function goBack(){
 if(!backStack.length)return;
 forwardStack.push(active);
 showTarget(backStack.pop());
}
function goForward(){
 if(!forwardStack.length)return;
 backStack.push(active);
 showTarget(forwardStack.pop());
}
function goHome(){
 if(active!=='home')backStack.push(active);
 forwardStack=[];
 showTarget('home');
}
window.show=function(id){
 if(!enabled(id))return baseShow(id);
 if(navigating)return baseShow(id);
 if(id!==active){
  backStack.push(active);
  if(backStack.length>50)backStack.shift();
  forwardStack=[];
 }
 showTarget(id);
};
window.showHome=goHome;
window.AIANavigation={back:goBack,forward:goForward,home:goHome};
for(const id of ['editor','exportPanel']){
 get(id)?.querySelectorAll('.actions button').forEach(button=>{
  if(button.textContent.trim()==='Retour')button.onclick=goBack;
 });
}
paint();
})();