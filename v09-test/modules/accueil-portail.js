(()=>{
'use strict';
const main=document.querySelector('main'),home=document.getElementById('home');
if(!main||!home||document.getElementById('aia-hub'))return;
const css=document.createElement('style');
css.textContent='body.aia-hub-active main>*:not(#aia-hub){display:none!important}#aia-hub{background:transparent;border:0;padding:0;margin:0;box-shadow:none}#aia-hub[hidden],#aia-hub .hub-inner[hidden],#aia-hub .hub-grid[hidden]{display:none!important}#aia-hub .hub-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:0 2px;margin-top:clamp(25px,10vh,85px)}#aia-hub .hub-tile{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:13px;min-height:142px;min-width:0;padding:10px 5px;border:1px solid #bdcbd5;border-radius:18px;background:#fff;color:#152437;text-align:center;text-decoration:none;font-size:clamp(11px,2.7vw,16px);font-weight:750;overflow-wrap:anywhere}#aia-hub .hub-tile svg{width:44px;height:44px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}#aia-hub .hub-tile:focus-visible{outline:3px solid #2673af;outline-offset:2px}#aia-hub .hub-inner{padding:18px 6px;min-height:240px}#aia-hub .hub-inner h2{margin:18px 0;font-size:21px}#aia-hub .hub-inner p{color:#52657c;line-height:1.5}@media(min-width:600px){#aia-hub .hub-grid{gap:16px}#aia-hub .hub-tile{min-height:165px;font-size:17px}}@media(max-width:350px){#aia-hub .hub-grid{gap:7px}#aia-hub .hub-tile{min-height:115px;gap:9px}#aia-hub .hub-tile svg{width:35px;height:35px}}@media print{#aia-hub{display:none!important}}';
document.head.append(css);
const page=document.createElement('section');page.id='aia-hub';page.className='card';page.setAttribute('aria-label','Nouvel accueil AIA');
const grid=document.createElement('div');grid.className='hub-grid';const inner=document.createElement('div');inner.className='hub-inner';inner.hidden=true;
const paths={
 users:'M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 20v-2a4 4 0 0 0-3-3.87 M16 2.13a4 4 0 0 1 0 7.75',
 calendar:'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
 layers:'M12 2 2 8l10 6 10-6-10-6z M2 12l10 6 10-6 M2 16l10 6 10-6',
 file:'M6 2h9l5 5v15H6z M15 2v6h5 M9 13h8 M9 17h8',
 grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
 video:'M3 4h18v16H3z M10 8l6 4-6 4z',
 globe:'M2 12h20 M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20 M12 2c-6 5-6 15 0 20 6-5 6-15 0-20',
 book:'M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3z M12 6v15',
 gear:'M12 2v3 M12 19v3 M4.93 4.93l2.12 2.12 M16.95 16.95l2.12 2.12 M2 12h3 M19 12h3 M4.93 19.07l2.12-2.12 M16.95 7.05l2.12-2.12 M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10'
};
function icon(key){const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');const p=document.createElementNS(s.namespaceURI,'path');p.setAttribute('d',paths[key]);s.append(p);return s;}
function openHub(){page.hidden=false;grid.hidden=false;inner.hidden=true;document.body.classList.add('aia-hub-active');window.scrollTo(0,0);}
function leaveHub(target){document.body.classList.remove('aia-hub-active');page.hidden=true;window.show(target);}
function placeholder(name){grid.hidden=true;inner.hidden=false;inner.replaceChildren();const back=document.createElement('button');back.textContent='← Accueil';back.onclick=openHub;const title=document.createElement('h2');title.textContent=name;inner.append(back,title);if(name==='RÉGLAGES'){const btn=document.createElement('button');btn.textContent='Changer le mode clair / nuit';btn.onclick=()=>document.getElementById('aia-theme-toggle')?.click();inner.append(btn)}else{const p=document.createElement('p');p.textContent='Espace indépendant à construire, sans modifier les pages existantes.';inner.append(p)}window.scrollTo(0,0);}
const items=[['RÉPERTOIRE','users','indexPanel'],['RÉUNIONS','calendar','home'],['INDEX','layers','index'],['FICHES','file','library'],['RUBRIQUES','grid','rubriques'],['VIDÉOS','video','desk'],['JW.ORG','globe','https://www.jw.org/fr/'],['WOL','book','https://wol.jw.org/fr/wol/h/r30/lp-f'],['RÉGLAGES','gear','reglages']];
for(const [name,shape,target] of items){const link=target.startsWith('https://');const b=document.createElement(link?'a':'button');b.className='hub-tile';if(link){b.href=target;b.target='_blank';b.rel='noopener noreferrer'}else{b.type='button';b.onclick=()=>['index','rubriques','reglages'].includes(target)?placeholder(name):leaveHub(target)}b.append(icon(shape),document.createTextNode(name));grid.append(b)}
page.append(grid,inner);main.prepend(page);
const topHome=document.getElementById('aia-home-top');topHome?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openHub()},true);
window.showHome=openHub;
// Les boutons « Accueil » de la navigation historique gardent une ancienne fonction goHome.
// Intercepter leur clic avant cette fonction pour revenir au portail des neuf rubriques.
document.addEventListener('click',event=>{
 const button=event.target.closest?.('button[data-aia-home], #aia-index-home');
 if(!button)return;
 event.preventDefault();event.stopImmediatePropagation();openHub();
},true);
if(window.AIANavigation)window.AIANavigation.home=openHub;
const oldShow=window.show;
window.show=function(target){if(target==='aia-hub')return openHub();document.body.classList.remove('aia-hub-active');page.hidden=true;return oldShow(target)};
const params=new URLSearchParams(location.search);
if(!params.has('aia'))openHub();else page.hidden=true;
})();