/* AYA INDEX — bloc 1 : navigation et 10 thèmes, sans stockage. */
(()=>{
'use strict';
const main=document.querySelector('main');if(!main)return;
const topics=["L’avenir","La famille","Dieu","La prière","Jésus","Le Royaume de Dieu","Les souffrances","La mort","La religion","Actualité"];
const section=document.createElement('section');section.id='indexPanel';section.className='card hidden';
section.innerHTML='<div class="aia-index-tabs" role="group" aria-label="Rubriques"></div><div class="aia-index-layout"><nav class="aia-index-letters" aria-label="Alphabet"></nav><div class="aia-index-content" aria-live="polite"></div></div><div class="actions"><button type="button" id="aia-index-home">Retour accueil</button></div>';
main.append(section);
const tabs=section.querySelector('.aia-index-tabs'),letters=section.querySelector('.aia-index-letters'),content=section.querySelector('.aia-index-content');
let category='THÈMES',letter='';
function render(){
tabs.querySelectorAll('button').forEach(b=>{let on=b.textContent===category;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on))});
letters.querySelectorAll('button').forEach(b=>{let on=b.textContent===letter;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on))});
content.replaceChildren();const h=document.createElement('h3');h.textContent=category+(letter?' — '+letter:'');content.append(h);
if(category!=='THÈMES'){const p=document.createElement('p');p.className='muted';p.textContent='Aucune fiche intégrée pour le moment.';content.append(p);section.dispatchEvent(new CustomEvent('aia:index-render',{detail:{category,letter}}));return}
const grid=document.createElement('div');grid.className='aia-index-grid';
const key=t=>t.replace(/^(?:La |Le |Les |L’|L')/i,'').toLocaleUpperCase('fr-FR');
const items=topics.filter(t=>!letter||key(t).startsWith(letter));
items.forEach(t=>{const b=document.createElement('button');b.type='button';b.className='aia-index-tile';const pic=document.createElement('span');pic.className='aia-index-placeholder';pic.textContent='Illustration à venir';const name=document.createElement('strong');name.textContent=t;b.append(pic,name);b.onclick=()=>{content.replaceChildren();const title=document.createElement('h3');title.textContent=t;const p=document.createElement('p');p.className='muted';p.textContent='Fiche à préparer.';const back=document.createElement('button');back.textContent='Retour aux thèmes';back.onclick=render;content.append(title,p,back);section.dispatchEvent(new CustomEvent('aia:theme-open',{detail:{theme:t}}))};grid.append(b)});
content.append(grid);if(!items.length){const p=document.createElement('p');p.textContent='Aucun thème pour cette lettre.';content.append(p)}
section.dispatchEvent(new CustomEvent('aia:index-render',{detail:{category,letter}}));
}
['TRACTS','FICHES','THÈMES'].forEach(t=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=()=>{category=t;letter='';render()};tabs.append(b)});
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(l=>{const b=document.createElement('button');b.type='button';b.textContent=l;b.onclick=()=>{letter=letter===l?'':l;render()};letters.append(b)});
section.querySelector('#aia-index-home').onclick=()=>window.showHome?window.showHome():window.show('home');
const openButton=document.getElementById('aia-repertoire-open');
if(openButton)openButton.addEventListener('click',()=>window.show('indexPanel'));
render();
})();
