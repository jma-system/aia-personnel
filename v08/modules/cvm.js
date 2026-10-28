/* Bloc CVM V08 : source vérifiée, sélection multiple, aucun texte généré. */
const bridge = window.AIACvmBridge;
const trigger = document.createElement('button');
trigger.type = 'button'; trigger.textContent = 'Programme CVM · choisir les sujets';
trigger.style.cssText = 'width:100%;margin-top:10px';
trigger.hidden = !document.getElementById('cvm').classList.contains('selected');
document.getElementById('cvm').parentElement.after(trigger);
const dialog = document.createElement('dialog');
dialog.setAttribute('aria-label', 'Programme CVM');
dialog.style.cssText = 'width:calc(100% - 24px);max-width:620px;max-height:85dvh;border:1px solid #cad2dc;border-radius:12px;padding:16px;overflow:auto';
const heading = document.createElement('h2'); heading.textContent = 'Programme CVM';
const status = document.createElement('p'); status.setAttribute('role','status');
const list = document.createElement('div');
const links = document.createElement('p');
const close = document.createElement('button'); close.type='button'; close.textContent='Fermer'; close.onclick=()=>dialog.close();
const add = document.createElement('button'); add.type='button'; add.className='primary'; add.textContent='Enregistrer les sujets cochés'; add.disabled=true;
const actions=document.createElement('div');actions.className='actions';actions.append(close,add);
dialog.append(heading,status,links,list,actions);document.body.append(dialog);
// Les styles sont limités au dialogue ; aucune modification des styles PDF.
const style=document.createElement('style');style.textContent='dialog::backdrop{background:#0008}@media print{dialog{display:none!important}}';document.head.append(style);
let weeks=null, active=null, openingDate='', openingFormat='';
function link(label,url){const a=document.createElement('a');a.textContent=label;a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function validSource(url){try{const u=new URL(url);return u.protocol==='https:' && ['wol.jw.org','www.jw.org'].includes(u.hostname)}catch{return false}}
function updateAdd(){add.disabled=!list.querySelector('input:checked')}
trigger.onclick=async()=>{
  openingDate=bridge.getDate();openingFormat=bridge.getFormat();active=null;
  list.replaceChildren();links.replaceChildren();add.disabled=true;status.textContent='Chargement du programme…';dialog.showModal();
  try {
    if(!weeks){const response=await fetch(new URL('../data/cvm.json',import.meta.url));if(!response.ok)throw new Error('Programme indisponible.');const data=await response.json();if(data.schema!==1 || !Array.isArray(data.weeks))throw new Error('Programme illisible.');weeks=data.weeks;}
    if(!dialog.open)return;
    active=weeks.find(w=>openingDate>=w.start && openingDate<=w.end);
    if(!active){status.textContent='Aucun programme intégré pour cette date. Consulte WOL ; tu peux saisir le sujet manuellement dans AIA.';const d=openingDate.split('-').map(Number);if(d.length===3 && d.every(Number.isFinite))links.append(link('Ouvrir WOL pour cette date',`https://wol.jw.org/fr/wol/dt/r30/lp-f/${d[0]}/${d[1]}/${d[2]}`));return;}
    if(!validSource(active.source)||!validSource(active.jwSource)||!Array.isArray(active.subjects))throw new Error('Source non reconnue.');
    heading.textContent='CVM · '+active.label;
    status.textContent=active.reading+' · Programme vérifié le '+active.checked+' · Format : '+openingFormat+'. Mise à jour automatique non activée.';
    links.append(link('Source WOL',active.source),document.createTextNode(' · '),link('Source JW.org',active.jwSource));
    for(const subject of active.subjects){const label=document.createElement('label');label.style.cssText='display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #ddd';const c=document.createElement('input');c.type='checkbox';c.value=String(subject.number);c.style.cssText='width:22px;height:22px;flex:none';c.onchange=updateAdd;label.append(c,document.createTextNode(subject.number+'. '+subject.title));list.append(label);}
  }catch(error){status.textContent='Impossible de charger le programme. Réessaie ou utilise la saisie manuelle.';}
};
add.onclick=()=>{
  if(!active)return;
  const selected=new Set([...list.querySelectorAll('input:checked')].map(c=>Number(c.value)));
  const items=active.subjects.filter(s=>selected.has(s.number)).map(s=>({publication:'CVM',format:openingFormat,subject:s.number+'. '+s.title,date:openingDate}));
  if(!items.length)return;
  try{bridge.enqueue(items);dialog.close();message(items.length+' sujets CVM enregistrés.');}catch(error){status.textContent=error.message;}
};
document.getElementById('cvm').addEventListener('click',()=>{trigger.hidden=false});
document.getElementById('tg').addEventListener('click',()=>{trigger.hidden=true});
