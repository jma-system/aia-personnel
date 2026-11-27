(()=>{
'use strict';
const main=document.querySelector('main'),home=document.getElementById('home');
if(!main||!home||document.getElementById('aia-hub'))return;
const css=document.createElement('style');
css.textContent='body.aia-hub-active main>*:not(#aia-hub){display:none!important}#aia-hub{background:transparent;border:0;padding:0;margin:0;box-shadow:none}#aia-hub[hidden],#aia-hub .hub-inner[hidden],#aia-hub .hub-grid[hidden]{display:none!important}#aia-hub .hub-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:0 2px;margin-top:clamp(25px,10vh,85px)}#aia-hub .hub-tile{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:13px;min-height:142px;min-width:0;padding:10px 5px;border:2px solid #70a9e4;border-radius:18px;background:linear-gradient(180deg,#d4eaff,#acd5ff)!important;color:#103e79!important;text-align:center;text-decoration:none;font-size:clamp(11px,2.7vw,16px);font-weight:750;overflow-wrap:anywhere;box-shadow:0 3px 8px #0b55a21c}#aia-hub .hub-tile:nth-child(3n+2){background:linear-gradient(180deg,#e3f1ff,#c3e1ff)!important}#aia-hub .hub-tile:nth-child(3n){background:linear-gradient(180deg,#c8e4ff,#9fccff)!important}#aia-hub .hub-tile:active{background:#77b9fb!important}#aia-hub .hub-tile svg{width:44px;height:44px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}#aia-hub .hub-tile:focus-visible{outline:3px solid #2673af;outline-offset:2px}#aia-hub .hub-inner{padding:18px 6px;min-height:240px}#aia-hub .hub-inner h2{margin:18px 0;font-size:21px}#aia-hub .hub-inner p{color:#52657c;line-height:1.5}@media(min-width:600px){#aia-hub .hub-grid{gap:16px}#aia-hub .hub-tile{min-height:165px;font-size:17px}}@media(max-width:350px){#aia-hub .hub-grid{gap:7px}#aia-hub .hub-tile{min-height:115px;gap:9px}#aia-hub .hub-tile svg{width:35px;height:35px}}@media print{#aia-hub{display:none!important}}';
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
function icon(key){
 const drawings={
  users:'<path d="M5 10h14l2 3v10H3V10z" fill="#eaa620" stroke="#fff4b9"/><path d="M3 9V5h7l2 2h10v15H3z" fill="url(#gold)" stroke="#fff0a1"/><path d="M5 13h16l-2 10H3z" fill="url(#gold)" stroke="#ffe59f"/>',
  calendar:'<rect x="3" y="5" width="18" height="18" rx="3" fill="url(#silver)" stroke="#c6faff"/><path d="M3 10h18" stroke="#0a70b7" stroke-width="2"/><path d="M8 3v5m8-5v5" stroke="#eafaff" stroke-width="3" stroke-linecap="round"/><path d="M7 13h3v3H7zm5 0h3v3h-3zm5 0h3v3h-3zM7 18h3v3H7zm5 0h3v3h-3z" fill="#3ba8e9"/>',
  layers:'<path d="M4 17l11-2 7 3-11 3z" fill="#42cdff" stroke="#ebf9ff"/><path d="M3 12l11-2 8 4-11 3z" fill="#fff4a8" stroke="#fff"/><path d="M4 7l11-3 7 4-11 4z" fill="url(#violet)" stroke="#f4d0ff"/><circle cx="13" cy="8" r="2" fill="none" stroke="#fff" stroke-width="1.3"/><path d="m14.5 9.5 2 2" stroke="#fff" stroke-width="1.3"/>',
  file:'<path d="M6 2h10l5 5v16H6z" fill="url(#silver)" stroke="#fff"/><path d="M16 2v6h5" fill="#7ddaff" stroke="#fff"/><path d="M9 12h9M9 15h9M9 18h7" stroke="#3989bb" stroke-width="1.5" stroke-linecap="round"/>',
  grid:'<rect x="2" y="2" width="9" height="9" rx="2" fill="url(#cyan)" stroke="#bafcff"/><rect x="13" y="2" width="9" height="9" rx="2" fill="url(#violet)" stroke="#f5cfff"/><rect x="2" y="13" width="9" height="9" rx="2" fill="url(#violet)" stroke="#f5cfff"/><rect x="13" y="13" width="9" height="9" rx="2" fill="url(#cyan)" stroke="#bafcff"/><path d="M4 7l3-3 2 3-3 2zM15 5h5m-5 3h4M5 17h4m-4 3h3m8-4h3v4h-3z" fill="none" stroke="#fff" stroke-width="1.1"/>',
  video:'<rect x="2" y="4" width="20" height="16" rx="3" fill="url(#navy)" stroke="#c3eaff"/><path d="m10 8 7 4-7 4z" fill="#a5ffff" stroke="#fff"/><path d="M5 18h14" stroke="#50cbff" stroke-width="1.3"/><circle cx="9" cy="18" r="1" fill="#fff"/>',
  globe:'<circle cx="12" cy="12" r="10" fill="url(#cyan)" stroke="#a9f5ff"/><ellipse cx="12" cy="12" rx="5" ry="10" fill="none" stroke="#e2ffff"/><path d="M2 12h20M4 7h16M4 17h16" stroke="#ddffff" fill="none" stroke-width=".8"/><path d="m6 8 3-3 3 2-1 3-3 2-1 4-3-3z" fill="#0c81ac"/>',
  book:'<path d="M2 5q5-2 10 2 5-4 10-2v15q-5-2-10 2-5-4-10-2z" fill="url(#silver)" stroke="#fcffff"/><path d="M12 7v15M4 9q4-1 6 1M4 12q4-1 6 1M14 10q3-2 6-1M14 13q3-2 6-1" stroke="#55869b" fill="none" stroke-width=".9"/><path d="M13 21l2 2v-5" fill="#ffb632"/>',
  gear:'<path d="M10 1h4l1 3 3 1 3-1 2 4-3 2v4l3 2-2 4-3-1-3 1-1 3h-4l-1-3-3-1-3 1-2-4 3-2v-4L1 8l2-4 3 1 3-1z" fill="url(#silver)" stroke="#f4fcff"/><circle cx="12" cy="12" r="5" fill="#122d54" stroke="#61ddff" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="#58d8ff"/>'
 };
 const s=document.createElement('span');s.className='hub-real-icon';s.setAttribute('aria-hidden','true');
 s.innerHTML='<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="gold" x2="0.7" y2="1"><stop stop-color="#fff5a0"/><stop offset="1" stop-color="#e99c00"/></linearGradient><linearGradient id="silver" x2=".8" y2="1"><stop stop-color="#ffffff"/><stop offset=".6" stop-color="#c5e7f6"/><stop offset="1" stop-color="#7cabc4"/></linearGradient><linearGradient id="cyan" x2=".8" y2="1"><stop stop-color="#bdffff"/><stop offset="1" stop-color="#008ed1"/></linearGradient><linearGradient id="violet" x2=".8" y2="1"><stop stop-color="#fac7ff"/><stop offset="1" stop-color="#8723d5"/></linearGradient><linearGradient id="navy" x2=".8" y2="1"><stop stop-color="#29689a"/><stop offset="1" stop-color="#051b48"/></linearGradient></defs>'+drawings[key]+'</svg>';
 return s;
}
function openHub(){delete document.body.dataset.aiaUniverse;page.hidden=false;grid.hidden=false;inner.hidden=true;document.body.classList.add('aia-hub-active');window.scrollTo(0,0);}
function leaveHub(target,universe){document.body.dataset.aiaUniverse=universe;document.body.classList.remove('aia-hub-active');page.hidden=true;window.show(target);}
function placeholder(name,universe){document.body.dataset.aiaUniverse=universe;grid.hidden=true;inner.hidden=false;inner.replaceChildren();const back=document.createElement('button');back.textContent='← Accueil';back.onclick=openHub;const title=document.createElement('h2');title.textContent=name;inner.append(back,title);if(name==='RÉGLAGES'){
 const btn=document.createElement('button');btn.textContent='Changer le mode clair / nuit';
 btn.onclick=()=>document.getElementById('aia-theme-toggle')?.click();inner.append(btn);
 const preset=document.createElement('section');preset.setAttribute('aria-label','Gabarit des fiches illustrées');
 preset.style.cssText='margin-top:20px;padding:14px;border:1px solid #8cc4dc;border-radius:12px;background:#edf8ff;color:#172234';
 const h=document.createElement('h3');h.textContent='Gabarit — Fiches illustrées';h.style.cssText='font-size:17px;margin:0 0 8px';
 const status=document.createElement('p');status.textContent='Chargement du gabarit…';status.style.cssText='font-size:14px;margin:0';
 preset.append(h,status);inner.append(preset);
 fetch('./standards/gabarit-six-fiches.json?v=2-dimensions',{cache:'no-store'}).then(response=>{
  if(!response.ok)throw Error('Gabarit indisponible');
  return response.json();
 }).then(data=>{
  if(data.schema!==1||data.id!=='aia-fiches-illustrees-six'||!Array.isArray(data.examples)||data.examples.length!==6)throw Error('Gabarit invalide');
  if(!preset.isConnected)return;
  status.textContent='Modèle de référence : '+data.examples.length+' fiches déjà validées. Non appliqué automatiquement.';
  const lines=[
   'Bandeau bleu et question en titre',
   'Illustration à gauche ; 3 ou 4 encadrés à droite',
   'Verdana et liens bibliques directs vers JW.org',
   'QR code, PDF et Partager en bas'
  ];
  const list=document.createElement('ul');list.style.cssText='font-size:14px;line-height:1.55;padding-left:22px';
  for(const item of lines){const li=document.createElement('li');li.textContent=item;list.append(li)}
  const note=document.createElement('p');note.textContent='Gabarit enregistré pour les prochaines créations ; les six fiches actuelles restent inchangées.';
  note.style.cssText='font-size:13px;margin:8px 0 0';preset.append(list);
  const dimensionsHeading=document.createElement('h4');dimensionsHeading.textContent='Dimensions des 6 fiches (fichiers WebP)';dimensionsHeading.style.cssText='font-size:14px;margin:12px 0 6px';preset.append(dimensionsHeading);
  const dimensionsList=document.createElement('ul');dimensionsList.style.cssText='font-size:13px;line-height:1.55;padding-left:22px';
  for(const fiche of data.examples){
   const li=document.createElement('li');
   li.textContent=fiche.title+' : '+fiche.widthPx+' × '+fiche.heightPx+' px';
   dimensionsList.append(li);
  }
  preset.append(dimensionsList);
  note.textContent='STANDARD NOUVELLES FICHES : '+data.dimensions.futureStandard.widthPx+' × '+data.dimensions.futureStandard.heightPx+' px (modèle FAMILLE). Les six premières restent strictement inchangées.';
  preset.append(note);
 }).catch(()=>{status.textContent='Gabarit enregistré dans GitHub, mais chargement indisponible pour le moment.'});
}else{const p=document.createElement('p');p.textContent='Espace indépendant à construire, sans modifier les pages existantes.';inner.append(p)}window.scrollTo(0,0);}
const items=[['RÉPERTOIRE','users','indexPanel','repertoire'],['RÉUNIONS','calendar','home','reunions'],['INDEX','layers','index','index'],['FICHES','file','library','fiches'],['RUBRIQUES','grid','rubriques','rubriques'],['VIDÉOS','video','desk','videos'],['JW.ORG','globe','https://www.jw.org/fr/','jworg'],['WOL','book','https://wol.jw.org/fr/wol/h/r30/lp-f','wol'],['RÉGLAGES','gear','reglages','reglages']];
for(const [name,shape,target,universe] of items){const link=target.startsWith('https://');const b=document.createElement(link?'a':'button');b.className='hub-tile';b.dataset.universe=universe;b.setAttribute('aria-label',name);if(link){b.href=target;b.target='_blank';b.rel='noopener noreferrer'}else{b.type='button';b.onclick=()=>['index','rubriques','reglages'].includes(target)?placeholder(name,universe):leaveHub(target,universe)}b.append(icon(shape),document.createTextNode(name));grid.append(b)}

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
window.show=function(target){if(target==='aia-hub')return openHub();const direct={home:'reunions',indexPanel:'repertoire',library:'fiches',desk:'videos'};if(direct[target])document.body.dataset.aiaUniverse=direct[target];document.body.classList.remove('aia-hub-active');page.hidden=true;return oldShow(target)};
const params=new URLSearchParams(location.search);
if(!params.has('aia'))openHub();else page.hidden=true;
})();