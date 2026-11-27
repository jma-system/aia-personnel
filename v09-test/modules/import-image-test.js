/* AIA — Répertoire permanent (test) : IndexedDB, photos et classements.
   Stockage local à cet appareil/navigateur. Drive reste sauvegarde externe. */
(()=>{
'use strict';
const section=document.getElementById('indexPanel');
const area=section?.querySelector('.aia-index-content');
if(!section||!area)return;
const topics=['L’avenir','La famille','Dieu','La prière','Jésus','Le Royaume de Dieu','Les souffrances','La mort','La religion','Actualité'];
const categories=['TRACTS','FICHES'];
const allowed=new Set(['image/png','image/jpeg','image/webp']);
const records=[];
const customSubthemes=[];
const selectedSubtheme=new Map();
const extraStore='sous-themes';
const dbName='aia-repertoire-v09-test';
const storeName='fiches';
let db=null,ready=false,request=null,focusBefore=null,replaceId=null,activeTheme=null;
const picker=document.createElement('input');
picker.type='file';picker.accept='image/png,image/jpeg,image/webp';picker.multiple=true;
// Android : le sélecteur doit être ouvert par le geste natif sur un label, pas par input.click().
picker.id='aia-repertoire-native-picker';
picker.style.cssText='position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden';
function nativeImportLabel(topic){
 const label=document.createElement('label');
 label.className='aia-import-button';
 label.htmlFor=picker.id;
 label.textContent='Importer';
 label.setAttribute('aria-label',topic);
 label.style.cursor='pointer';
 return label;
}
section.append(picker);
const viewer=document.createElement('div');
viewer.className='aia-photo-viewer';viewer.hidden=true;
viewer.setAttribute('role','dialog');viewer.setAttribute('aria-modal','true');viewer.setAttribute('aria-label','Image agrandie');
const close=document.createElement('button');close.type='button';close.className='aia-photo-close';
close.textContent='×';close.setAttribute('aria-label','Fermer');
const imageFrame=document.createElement('div');imageFrame.className='aia-photo-frame';
const large=document.createElement('img');large.alt='Fiche agrandie';
// Premier contrôle ciblé : seul le titre du bandeau de la fiche AVENIR change.
// L'image approuvée reste intacte ; aucun autre texte ou lien n'est retouché.
const avenirTitle=document.createElement('span');
avenirTitle.className='aia-approved-header-title';
avenirTitle.textContent='Tract - Avenir';
avenirTitle.hidden=true;
avenirTitle.setAttribute('aria-label','Tract - Avenir');
const jesusQuestion=document.createElement('span');
jesusQuestion.className='aia-approved-jesus-question';
jesusQuestion.textContent='Les conseils de Jésus sont-ils utiles ?';
jesusQuestion.hidden=true;
const avenirQuestion=document.createElement('span');
avenirQuestion.className='aia-approved-avenir-question';
avenirQuestion.textContent='Peut-on vivre pour toujours ?';
avenirQuestion.hidden=true;
const royaumeQuestion=document.createElement('span');
royaumeQuestion.className='aia-approved-royaume-question';
royaumeQuestion.textContent='Que fera le Royaume de Dieu ?';
royaumeQuestion.hidden=true;
const familleQuestion=document.createElement('span');
familleQuestion.className='aia-approved-famille-question';
familleQuestion.textContent='Une famille heureuse - Est-ce possible ?';
familleQuestion.hidden=true;
const dieuQuestion=document.createElement('span');
dieuQuestion.className='aia-approved-dieu-question';
dieuQuestion.textContent='Qui est le vrai Dieu ?';
dieuQuestion.hidden=true;
// Les liens sont des zones transparentes placées exactement sur les textes bleus.
const familyVerseLinks=[
 {name:'Éphésiens 5:28, 33',verse:'Éphésiens 5:28',url:'https://www.jw.org/fr/biblioth%C3%A8que/bible/nwt/livres/%C3%89ph%C3%A9siens/5/#v49005028',pos:'eph'},
 {name:'Colossiens 3:18-21',verse:'Colossiens 3:18',url:'https://www.jw.org/fr/biblioth%C3%A8que/bible/nwt/livres/Colossiens/3/#v51003018',pos:'col'},
 {name:'Psaume 128:1-3',verse:'Psaume 128:1',url:'https://www.jw.org/fr/biblioth%C3%A8que/bible/nwt/livres/Psaumes/128/#v19128001',pos:'ps'}
].map(entry=>{
 const link=document.createElement('a');
 link.className='aia-verse-hotspot aia-verse-'+entry.pos;
 link.href=entry.url;link.target='_blank';link.rel='noopener noreferrer';
 link.setAttribute('aria-label','Lire '+entry.verse+' sur JW.org');
 link.title=entry.name+' — ouvrir la Traduction du monde nouveau';
 // Neutraliser même une ancienne règle de diagnostic CSS encore en cache Android.
 // Les zones sont invisibles mais restent directement tactiles sur le texte imprimé.
 const coords={eph:['53%','37.9%','39%','4%'],col:['53%','56.4%','39%','4%'],ps:['53%','75.2%','39%','4%']}[entry.pos];
 const paint={left:coords[0],top:coords[1],width:coords[2],height:coords[3],bottom:'auto',transform:'none',background:'transparent',outline:'none',border:'0',boxShadow:'none',padding:'0',minHeight:'0',fontSize:'0'};
 for(const [property,value] of Object.entries(paint)){
  link.style.setProperty(property.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),value,'important');
 }
 link.hidden=true;
 return link;
});
imageFrame.append(large,avenirTitle,jesusQuestion,avenirQuestion,royaumeQuestion,familleQuestion,dieuQuestion,...familyVerseLinks);
// Fiche Prière : trois liens directs, sans modification de l'image.
const prayerVerseLinks=[
 {name:'Psaume 65:2',url:'https://www.jw.org/fr/biblioth%C3%A8que/bible/nwt/livres/Psaumes/65/#v19065002',coords:[48.5,39.8,25,3.3]},
 {name:'Matthieu 6:7-13',url:'https://www.jw.org/fr/biblioth%C3%A8que/bible/nwt/livres/Matthieu/6/#v40006007',coords:[48.5,54,33,3.6]},
 {name:'Matthieu 7:7, 8',url:'https://www.jw.org/fr/biblioth%C3%A8que/bible/nwt/livres/Matthieu/7/#v40007007',coords:[48.5,71.4,33,3.5]}
].map(entry=>{
 const link=document.createElement('a');
 link.className='aia-verse-hotspot aia-prayer-verse';
 link.href=entry.url;link.target='_blank';link.rel='noopener noreferrer';
 link.setAttribute('aria-label','Lire '+entry.name+' sur JW.org');
 link.title=entry.name+' — Traduction du monde nouveau';
 const [left,top,width,height]=entry.coords;
 const paint={left:left+'%',top:top+'%',width:width+'%',height:height+'%',bottom:'auto',transform:'none',background:'transparent',outline:'none',border:'0',boxShadow:'none',padding:'0',minHeight:'0',fontSize:'0'};
 for(const [property,value] of Object.entries(paint)){
  link.style.setProperty(property.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),value,'important');
 }
 link.hidden=true;
 return link;
});
imageFrame.append(...prayerVerseLinks);
// Fiche Jésus : trois zones tactiles sur les références imprimées.
// Coordonnées mesurées sur la capture de référence Jésus, à vérifier sur téléphone.
const jesusVerseLinks=[
 {name:'Matthieu 7:12',url:'https://www.jw.org/fr/biblioth%C3%A8que/bible/nwt/livres/Matthieu/7/#v40007012',coords:[57,37.7,35,3.6]},
 {name:'Jean 13:34, 35',url:'https://www.jw.org/fr/biblioth%C3%A8que/bible/nwt/livres/Jean/13/#v43013034',coords:[57,54.3,35,3.6]},
 {name:'Matthieu 11:28-30',url:'https://www.jw.org/fr/biblioth%C3%A8que/bible/nwt/livres/Matthieu/11/#v40011028',coords:[57,74.3,36,3.6]}
].map(entry=>{
 const link=document.createElement('a');
 link.className='aia-verse-hotspot aia-jesus-verse';
 link.href=entry.url;link.target='_blank';link.rel='noopener noreferrer';
 link.setAttribute('aria-label','Lire '+entry.name+' sur JW.org');
 link.title=entry.name;
 const [left,top,width,height]=entry.coords;
 for(const [property,value] of Object.entries({left:left+'%',top:top+'%',width:width+'%',height:height+'%',bottom:'auto',transform:'none',background:'transparent',outline:'none',border:'0',boxShadow:'none',padding:'0',minHeight:'0',fontSize:'0'})){
  link.style.setProperty(property.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),value,'important');
 }
 link.hidden=true;
 return link;
});
imageFrame.append(...jesusVerseLinks);

/* Fiche Royaume réutilisable : mêmes liens quel que soit le classement.
   Les positions sont relatives à l'image complète (gabarit illustré). */
const kingdomReferences=[
 {name:'Psaume 37:10, 11',url:'https://www.jw.org/fr/biblioth%C3%A8que/bible/bible-d-etude/livres/psaumes/37/#v19037010',coords:[52,37.3,36,3.8]},
 {name:'Daniel 2:44',url:'https://www.jw.org/fr/biblioth%C3%A8que/bible/bible-d-etude/livres/daniel/2/#v27002044',coords:[52,52.3,30,3.2]},
 {name:'Daniel 7:14',url:'https://www.jw.org/fr/biblioth%C3%A8que/bible/bible-d-etude/livres/daniel/7/#v27007014',coords:[52,55.2,25,3.2]},
 {name:'Isaïe 65:21-23',url:'https://www.jw.org/fr/biblioth%C3%A8que/bible/bible-d-etude/livres/isaie/65/#v23065021',coords:[52,69.2,36,3.8]}
];
const kingdomVerseLinks=kingdomReferences.map(entry=>{
 const a=document.createElement('a');
 a.className='aia-verse-hotspot aia-kingdom-verse';
 a.href=entry.url;a.target='_blank';a.rel='noopener noreferrer';
 a.title=entry.name;a.setAttribute('aria-label','Lire '+entry.name+' sur JW.org');
 const [x,y,w,h]=entry.coords;
 for(const [k,v] of Object.entries({left:x+'%',top:y+'%',width:w+'%',height:h+'%',bottom:'auto',transform:'none',background:'transparent',outline:'none',border:'0',boxShadow:'none',padding:'0',minHeight:'0',position:'absolute',zIndex:'6',pointerEvents:'auto'})){
  a.style.setProperty(k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),v,'important');
 }
 a.hidden=true;return a;
});
imageFrame.append(...kingdomVerseLinks);


// Accessible links remain tappable even when an imported screenshot is cropped differently.
const kingdomStudyLinks=document.createElement('nav');
kingdomStudyLinks.hidden=true;
kingdomStudyLinks.setAttribute('aria-label','Versets — Bible d’étude JW.org');
kingdomStudyLinks.style.cssText='display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding:10px 8px;background:#eaf7ff;border-radius:12px';
for(const entry of kingdomReferences){
 const a=document.createElement('a');a.href=entry.url;a.target='_blank';a.rel='noopener noreferrer';
 a.textContent=entry.name;a.style.cssText='display:inline-block;padding:10px 12px;border:1px solid #78b6d5;border-radius:8px;color:#07549b;background:#fff;font:600 14px Verdana,sans-serif;text-decoration:underline';
 kingdomStudyLinks.append(a);
}
// Les liens Royaume disposent déjà de zones tactiles sur la fiche.
// Ne pas afficher un second panneau de versets à côté de l'image.
kingdomStudyLinks.hidden=true;
// Generic, data-driven links for every PDF-derived fiche; no image-coordinate dependency.
const savedStudyLinks=document.createElement('nav');
savedStudyLinks.setAttribute('aria-label','Références — Bible d’étude JW.org');
savedStudyLinks.style.cssText='display:none;flex-wrap:wrap;gap:8px;justify-content:center;padding:10px 8px;background:#eaf7ff;border-radius:12px';
// Références génériques accessibles sur demande, sous la fiche et jamais à sa droite.
const studyDetails=document.createElement('details');
studyDetails.className='aia-saved-references';
const studySummary=document.createElement('summary');
studySummary.textContent='Références bibliques';
studyDetails.append(studySummary,savedStudyLinks);
function renderStudyLinks(item){
 savedStudyLinks.replaceChildren();
 const seen=new Set();
 for(const ref of (Array.isArray(item.references)?item.references:[])){
  const book=Number(ref.book),ch=Number(ref.chapter),verse=Number(ref.verse);
  if(!Number.isInteger(book)||book<1||book>66||!Number.isInteger(ch)||ch<1||ch>150||!Number.isInteger(verse)||verse<1||verse>176)continue;
  const slug=String(ref.slug||'');if(!/^[a-z0-9-]+$/.test(slug))continue;
  const id=String(book).padStart(2,'0')+String(ch).padStart(3,'0')+String(verse).padStart(3,'0');
  if(seen.has(id))continue;seen.add(id);
  const a=document.createElement('a');
  a.href='https://www.jw.org/fr/biblioth%C3%A8que/bible/bible-d-etude/livres/'+slug+'/'+ch+'/#v'+id;
  a.target='_blank';a.rel='noopener noreferrer';
  a.textContent=String(ref.reference||slug+' '+ch+':'+verse).slice(0,100);
  a.style.cssText='display:inline-block;padding:10px 12px;border:1px solid #78b6d5;border-radius:8px;color:#07549b;background:#fff;font:600 14px Verdana,sans-serif;text-decoration:underline';
  savedStudyLinks.append(a);
 }
 savedStudyLinks.style.display=seen.size?'flex':'none';
 studyDetails.hidden=!seen.size;
 studyDetails.open=false;
}
const linkButton=document.createElement('button');
linkButton.type='button';linkButton.className='aia-link-editor-button';
linkButton.textContent='Ajouter un verset';
linkButton.hidden=true; // Éditeur différé : aucun bouton nouveau dans la visionneuse.
linkButton.setAttribute('aria-label','Ajouter un lien biblique sur cette image');
const statusLink=document.createElement('div');statusLink.className='aia-link-editor-status';statusLink.hidden=true;
const userLinks=document.createElement('div');userLinks.className='aia-custom-links';
imageFrame.append(userLinks);
imageFrame.append(close);
viewer.append(imageFrame,studyDetails,linkButton,statusLink);
const viewerFix=document.createElement('style');
viewerFix.textContent='.aia-photo-viewer{overflow-x:hidden!important;overflow-y:auto!important;box-sizing:border-box!important}.aia-photo-frame{display:block!important;box-sizing:border-box!important;max-width:min(100%,960px)!important;width:100%!important;margin-left:auto!important;margin-right:auto!important;min-width:0!important}.aia-photo-frame>img{display:block!important;width:100%!important;max-width:100%!important;height:auto!important;object-fit:contain!important}.aia-saved-references{box-sizing:border-box;max-width:min(100%,960px);margin:10px auto 24px;padding:8px 12px;border-radius:10px;background:#eaf7ff;color:#073a79;font:14px Verdana,sans-serif}.aia-saved-references[hidden]{display:none!important}.aia-saved-references summary{cursor:pointer;min-height:32px;display:list-item;padding:6px 0}.aia-saved-references nav{max-width:100%;overflow-wrap:anywhere}';
viewerFix.textContent += '.aia-photo-frame{position:relative!important}.aia-approved-header-title{position:absolute;left:15%;top:0;width:70%;height:8.1%;display:flex;align-items:center;justify-content:center;pointer-events:none;color:#fff;background:#013060;font:400 clamp(12px,4vw,36px)/1.1 Verdana,Geneva,sans-serif;white-space:nowrap;z-index:3}.aia-approved-header-title[hidden]{display:none!important}';
viewerFix.textContent += '.aia-approved-jesus-question{position:absolute;left:10.1%;top:11.5%;width:86%;height:10.2%;display:flex;align-items:center;justify-content:flex-start;box-sizing:border-box;padding:0 1%;background:#cfe8fc;color:#061a35;font:400 5cqw/1.14 Verdana,Geneva,sans-serif;pointer-events:none;z-index:3}.aia-approved-jesus-question[hidden]{display:none!important}';
viewerFix.textContent += '.aia-photo-frame{container-type:inline-size!important}';
viewerFix.textContent += '.aia-approved-avenir-question{position:absolute;left:11%;top:9.55%;width:84%;height:7.7%;box-sizing:border-box;display:flex;align-items:center;padding:0 1%;color:#0a1935;background:#cde7fb;font:400 5cqw/1.15 Verdana,Geneva,sans-serif;pointer-events:none;z-index:3;white-space:nowrap}.aia-approved-avenir-question[hidden]{display:none!important}';
viewerFix.textContent += '.aia-approved-royaume-question{position:absolute;left:11.2%;top:10.45%;width:84.7%;height:10.35%;display:flex;align-items:center;justify-content:flex-start;box-sizing:border-box;padding:0 1%;background:#cfe8fc;color:#061a35;font:400 5cqw/1.16 Verdana,Geneva,sans-serif;pointer-events:none;z-index:3;white-space:nowrap}.aia-approved-royaume-question[hidden]{display:none!important}';
viewerFix.textContent += '.aia-photo-frame>.aia-photo-close{position:absolute!important;top:1.9%!important;right:17%!important;left:auto!important;bottom:auto!important;transform:none!important;z-index:8!important;width:clamp(34px,7cqw,44px)!important;height:clamp(34px,7cqw,44px)!important;display:grid!important;place-items:center!important;padding:0!important;line-height:1!important;cursor:pointer!important;pointer-events:auto!important;touch-action:manipulation!important}.aia-approved-famille-question{position:absolute;left:11%;top:11.2%;width:84.5%;height:13%;box-sizing:border-box;display:flex;align-items:center;justify-content:flex-start;padding:0 1%;background:#cfe8fc;color:#061a35;font:400 5cqw/1.14 Verdana,Geneva,sans-serif;pointer-events:none;z-index:3;white-space:normal}.aia-approved-famille-question[hidden]{display:none!important}.aia-approved-dieu-question{position:absolute;left:11.2%;top:10.85%;width:84.2%;height:8.1%;box-sizing:border-box;display:flex;align-items:center;justify-content:flex-start;padding:0 1%;background:#cfe8fc;color:#061a35;font:400 5cqw/1.14 Verdana,Geneva,sans-serif;pointer-events:none;z-index:3}.aia-approved-dieu-question[hidden]{display:none!important}';
document.head.append(viewerFix);document.body.append(viewer);
let currentPhoto=null,placingLink=false;
function parseVerseReference(input){
 const match=input.trim().match(/^(.+?)\\s+(\\d{1,3})\\s*:\\s*(\\d{1,3})(?:\\s*[-–,].*)?$/u);
 if(!match)return null;
 const names={
  'ephesiens':{slug:'%C3%89ph%C3%A9siens',book:49},
  'colossiens':{slug:'Colossiens',book:51},
  'psaume':{slug:'Psaumes',book:19},
  'psaumes':{slug:'Psaumes',book:19}
 };
 const norm=match[1].normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase();
 const book=names[norm],ch=Number(match[2]),vs=Number(match[3]);
 if(!book||!ch||!vs||ch>150||vs>176)return null;
 const anchor=String(book.book).padStart(2,'0')+String(ch).padStart(3,'0')+String(vs).padStart(3,'0');
 const url='https://www.jw.org/fr/biblioth%C3%A8que/bible/nwt/livres/'+book.slug+'/'+ch+'/#v'+anchor;
 return {reference:input.trim(),url};
}
function showSavedLinks(item){
 userLinks.replaceChildren();
 const links=Array.isArray(item.links)?item.links:[];
 for(const entry of links){
  if(typeof entry.x!=='number'||typeof entry.y!=='number'||typeof entry.url!=='string')continue;
  const link=document.createElement('a');
  link.className='aia-user-verse-target';link.href=entry.url;link.target='_blank';link.rel='noopener noreferrer';
  link.setAttribute('aria-label','Lire '+entry.reference+' sur JW.org');
  link.title=entry.reference;
  link.style.left=entry.x+'%';link.style.top=entry.y+'%';
  link.style.setProperty('pointer-events',placingLink?'none':'auto');
  userLinks.append(link);
 }
}
linkButton.addEventListener('click',()=>{
 if(!currentPhoto)return;
 placingLink=!placingLink;
 linkButton.textContent=placingLink?'Annuler le placement':'Ajouter un verset';
 statusLink.hidden=!placingLink;
 statusLink.textContent='Touche maintenant le texte du verset sur l’image.';
 imageFrame.classList.toggle('aia-placing-link',placingLink);
 familyVerseLinks.forEach(link=>link.style.pointerEvents=placingLink?'none':'auto');
 showSavedLinks(currentPhoto);
});
large.addEventListener('click',async event=>{
 if(!placingLink||!currentPhoto)return;
 const rect=large.getBoundingClientRect();
 if(!rect.width||!rect.height)return;
 const x=Math.max(4,Math.min(96,100*(event.clientX-rect.left)/rect.width));
 const y=Math.max(2,Math.min(98,100*(event.clientY-rect.top)/rect.height));
 const entry=prompt('Référence biblique (ex. Psaume 128:1) :');
 if(entry===null)return;
 const parsed=parseVerseReference(entry);
 if(!parsed){alert('Pour ce premier test, utilise une référence de Psaume(s), Éphésiens ou Colossiens, par exemple Psaume 128:1.');return}
 const updated={...currentPhoto,links:[...(currentPhoto.links||[]),{...parsed,x,y}]};
 try{
  await save(updated);
  currentPhoto=records.find(r=>r.id===updated.id)||updated;
  placingLink=false;linkButton.textContent='Ajouter un verset';statusLink.hidden=true;
  imageFrame.classList.remove('aia-placing-link');
  familyVerseLinks.forEach(link=>link.style.pointerEvents='auto');
  showSavedLinks(currentPhoto);
  alert('Lien enregistré. Touche le verset pour vérifier son ouverture.');
 }catch(error){alert('Lien non enregistré : '+error.message)}
});

// Bloquer uniquement le menu contextuel natif sur les images du Répertoire.
// Les clics courts, la sélection multiple et les boutons restent opérationnels.
function preventImageContextMenu(event){
 if(event.target.closest('img'))event.preventDefault();
}
section.addEventListener('contextmenu',event=>{
 if(event.target.closest('.aia-gallery-card'))preventImageContextMenu(event);
});
viewer.addEventListener('contextmenu',preventImageContextMenu);
large.draggable=false;
function openImage(item){
 focusBefore=document.activeElement;large.src=item.url;large.alt=item.label;
 currentPhoto=item;placingLink=false;statusLink.hidden=true;
 const validatedHeaderTitles={
  'aia-approved-avenir':'Tract - Avenir',
  'aia-approved-famille':'Tract - Famille',
  'aia-approved-jesus':'Tract - Jésus',
  'aia-approved-royaume':'Tract - Royaume'
 };
 const headerTitle=validatedHeaderTitles[item.id];
 avenirTitle.hidden=!headerTitle;
 jesusQuestion.hidden=item.id!=='aia-approved-jesus';
 familleQuestion.hidden=item.id!=='aia-approved-famille';
 dieuQuestion.hidden=item.id!=='aia-approved-dieu';
 avenirQuestion.hidden=item.id!=='aia-approved-avenir';
 royaumeQuestion.hidden=item.id!=='aia-approved-royaume';
 if(headerTitle){
  avenirTitle.textContent=headerTitle;
  avenirTitle.setAttribute('aria-label',headerTitle);
 }

 linkButton.textContent='Ajouter un verset';
 imageFrame.classList.remove('aia-placing-link');
 familyVerseLinks.forEach(link=>link.style.pointerEvents='auto');
 showSavedLinks(item);
 renderStudyLinks(item);
 // Ne montrer les liens que sur la fiche illustrée « La famille peut-elle être heureuse ? ».
 // Cette reconnaissance provisoire concerne uniquement le test personnel Famille.
 const isFamily=(item.topic==='La famille'||item.subtheme==='Famille'||/famille/i.test(item.label));
 familyVerseLinks.forEach(link=>{link.hidden=!isFamily});
 // Les deux emplacements (THÈMES/Prière et TRACTS/P/Prière) utilisent la même fiche.
 const isPrayer=item.topic==='La prière'||item.subtheme==='Prière'||
  activeTheme==='La prière'||
  (item.placements.some(p=>p.category==='TRACTS'&&p.letter==='P')&&
   selectedSubtheme.get('TRACTS|P')==='Prière')||
  (item.placements.some(p=>p.category==='FICHES'&&p.letter==='P')&&
   selectedSubtheme.get('FICHES|P')==='Prière');
 prayerVerseLinks.forEach(link=>{link.hidden=!isPrayer});
 // Uniquement la fiche Jésus : conserver les autres fiches inchangées.
 const isJesus=item.topic==='Jésus'||item.subtheme==='Jésus'||
  activeTheme==='Jésus'||/conseils de Jésus/i.test(item.label);
 jesusVerseLinks.forEach(link=>{link.hidden=!isJesus});
 const isKingdom=item.topic==='Le Royaume de Dieu'||item.subtheme==='Le Royaume de Dieu'||activeTheme==='Le Royaume de Dieu'||/royaume|royaume de dieu|t[-_]kng/i.test([item.label,item.name,item.filename,item.fileName].filter(Boolean).join(' '))||(Array.isArray(item.placements)&&item.placements.some(p=>/royaume/i.test(p.subtheme||'')));
 kingdomVerseLinks.forEach(link=>{link.hidden=!isKingdom});
 kingdomStudyLinks.hidden=true;
 kingdomStudyLinks.style.display='none';
 imageFrame.classList.toggle('aia-jesus-enlarged',isJesus);

 viewer.hidden=false;document.body.style.overflow='hidden';close.focus();
}
function closeImage(){
 viewer.hidden=true;large.removeAttribute('src');document.body.style.overflow='';currentPhoto=null;placingLink=false;
 if(focusBefore?.isConnected)focusBefore.focus();
 focusBefore=null;
}
close.onclick=closeImage;
viewer.addEventListener('click',e=>{if(e.target===viewer)closeImage()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!viewer.hidden)closeImage()});
function labelFrom(filename){return filename.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim()||'Fiche'}
function refresh(){
 const theme=activeTheme;
 section.dispatchEvent(new Event('aia:refresh-index'));
 if(theme){activeTheme=theme;renderTheme(theme)}
}
function note(msg){const p=document.createElement('p');p.className='aia-gallery-count';p.textContent=msg;area.append(p)}
function openDatabase(){
 return new Promise((resolve,reject)=>{
  if(!('indexedDB'in window)){reject(new Error('IndexedDB indisponible'));return}
  const req=indexedDB.open(dbName,2);
  req.onupgradeneeded=()=>{
   if(!req.result.objectStoreNames.contains(storeName))req.result.createObjectStore(storeName,{keyPath:'id'});
   if(!req.result.objectStoreNames.contains(extraStore))req.result.createObjectStore(extraStore,{keyPath:'id'});
  };
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||new Error('Ouverture impossible'));
 });
}
function operation(mode,perform,store=storeName){
 return new Promise((resolve,reject)=>{
  if(!db){reject(new Error('Stockage indisponible'));return}
  const tx=db.transaction(store,mode);
  const object=tx.objectStore(store);
  let result;
  try{result=perform(object)}catch(error){try{tx.abort()}catch(_){}reject(error);return}
  if(result&&typeof result==='object'&&'onsuccess'in result){
   result.onsuccess=()=>{result=result.result};
  }
  tx.oncomplete=()=>resolve(result);
  tx.onerror=()=>reject(tx.error||new Error('Échec de stockage'));
  tx.onabort=()=>reject(tx.error||new Error('Transaction annulée'));
 });
}
function makeRecord(raw){return {...raw,url:URL.createObjectURL(raw.blob)}}
function discard(item){if(item?.url)URL.revokeObjectURL(item.url)}
async function save(item){
 const raw={id:item.id,blob:item.blob,label:item.label,topic:item.topic,subtheme:item.subtheme||'',placements:item.placements,links:Array.isArray(item.links)?item.links:[],references:Array.isArray(item.references)?item.references:[]};
 await operation('readwrite',store=>store.put(raw));
 const index=records.findIndex(r=>r.id===item.id);
 if(index>=0){discard(records[index]);records[index]=makeRecord(raw)}
 else records.push(makeRecord(raw));
 refresh();
}
async function removeEverywhere(item){
 await operation('readwrite',store=>store.delete(item.id));
 const index=records.findIndex(r=>r.id===item.id);
 if(index>=0){discard(records[index]);records.splice(index,1)}
 refresh();
}
async function removeHere(item,category,letter){
 const remain=item.placements.filter(p=>!(p.category===category&&p.letter===letter));
 if(!remain.length){await removeEverywhere(item);return}
 await save({...item,placements:remain});
}
function controlled(btn,fn){
 btn.addEventListener('click',async()=>{
  if(btn.disabled)return;
  btn.disabled=true;
  try{await fn()}catch(error){alert('Modification impossible : '+(error?.message||'erreur de stockage'))}
  finally{if(btn.isConnected)btn.disabled=false}
 });
 return btn;
}
function makeButton(text,cls){
 const button=document.createElement('button');
 button.type='button';button.textContent=text;button.className=cls||'aia-gallery-action';
 return button;
}
function thumb(item){
 const btn=makeButton('', 'aia-gallery-card');
 btn.setAttribute('aria-label','Ouvrir '+item.label);
 if(item.readOnly)btn.classList.add('aia-approved-thumb');
 const image=document.createElement('img');image.src=item.url;image.alt='';image.draggable=false;
 btn.append(image);
 // Masquer les noms purement numériques attribués aux photos (ex. 40495).
 if(!item.readOnly && !/^\d+$/.test(item.label.trim())){
  const title=document.createElement('span');title.textContent=item.label;btn.append(title);
 }
 btn.onclick=()=>openImage(item);return btn;
}
// Fiche illustrée Jésus validée : un seul fichier partagé par TRACTS et THÈMES.
// Le fichier n'est pas enregistré dans IndexedDB.
const jesusApproved={id:'aia-jesus-approved',label:'Les conseils de Jésus sont-ils efficaces aujourd’hui ?',topic:'Jésus',subtheme:'Jésus',placements:[{category:'TRACTS',letter:'J'}],url:'./fiches/jesus-apercu.webp?v=2',readOnly:true};

// Six fiches illustrées validées, versionnées dans GitHub et indépendantes du stockage local.
// Lecture seule : aucune création de doublon IndexedDB et aucune suppression possible.
const sixApproved=[
 {id:'aia-approved-avenir',label:'Peut-on vivre pour toujours ?',topic:'L’avenir',subtheme:'Avenir',placements:[{category:'TRACTS',letter:'A'}],url:'./fiches/avenir-restaure.webp',readOnly:true},
 {id:'aia-approved-dieu',label:'Qui est le vrai Dieu ?',topic:'Dieu',subtheme:'Dieu',placements:[{category:'TRACTS',letter:'D'}],url:'./fiches/dieu-restaure.webp',readOnly:true},
 {id:'aia-approved-famille',label:'La famille peut-elle être heureuse ?',topic:'La famille',subtheme:'Famille',placements:[],url:'./fiches/famille-restauree.webp',readOnly:true},
 {id:'aia-approved-jesus',label:'Les conseils de Jésus sont-ils efficaces aujourd’hui ?',topic:'Jésus',subtheme:'Jésus',placements:[{category:'TRACTS',letter:'J'}],url:'./fiches/jesus-restaure.webp',readOnly:true},
 {id:'aia-approved-priere',label:'Est-ce que quelqu’un écoute nos prières ?',topic:'La prière',subtheme:'Prière',placements:[],url:'./fiches/priere-restauree.webp',readOnly:true},
 {id:'aia-approved-royaume',label:'Comment le royaume de Dieu résoudra-t-il nos problèmes ?',topic:'Le Royaume de Dieu',subtheme:'Royaume',placements:[{category:'TRACTS',letter:'R'}],url:'./fiches/royaume-restaure.webp',readOnly:true}
];
// Fiches locales conservées telles quelles. Une ressource statique n'est pas ajoutée
// si une fiche enregistrée porte déjà le même intitulé dans le même thème.
function allFiches(){
 return records.concat(sixApproved.filter(approved=>!records.some(r=>
  r.topic===approved.topic&&String(r.label||'').trim().toLocaleLowerCase('fr-FR')===approved.label.toLocaleLowerCase('fr-FR')
 )));
}

function gallery(items,category='',letter='',theme=''){
 const wrap=document.createElement('div');wrap.className='aia-gallery-list';
 const bar=document.createElement('div');bar.className='aia-gallery-selection-bar';
 const choose=makeButton('S','aia-gallery-choose');
 choose.setAttribute('aria-label','Sélectionner des images');
 choose.title='Sélectionner des images';
 choose.setAttribute('aria-pressed','false');
 const count=document.createElement('span');count.className='aia-gallery-selected-count';
 count.setAttribute('aria-live','polite');
 const trash=makeButton('🗑','aia-gallery-batch-trash');
 trash.setAttribute('aria-label','Supprimer les images sélectionnées');
 trash.title='Supprimer la sélection';trash.disabled=true;
 bar.append(choose,count,trash);
 const grid=document.createElement('div');grid.className='aia-gallery-grid';
 const selectedIds=new Set();
 let selectionActive=false;
 const cells=[];
 function update(){
  choose.textContent='S';
  choose.setAttribute('aria-label',selectionActive?'Annuler la sélection':'Sélectionner des images');
  choose.title=selectionActive?'Annuler la sélection':'Sélectionner des images';
  choose.setAttribute('aria-pressed',String(selectionActive));
  count.textContent=selectionActive&&selectedIds.size>0?String(selectedIds.size):'';
  trash.disabled=!selectionActive||selectedIds.size===0;
  grid.classList.toggle('is-selecting',selectionActive);
  for(const {item,button,tick} of cells){
   const checked=selectedIds.has(item.id);
   button.classList.toggle('is-selected',checked);
   button.setAttribute('aria-pressed',selectionActive?String(checked):'false');
   button.setAttribute('aria-label',selectionActive?(checked?'Désélectionner ':'Sélectionner ')+item.label:'Ouvrir '+item.label);
   tick.hidden=!selectionActive;
   tick.textContent=checked?'✓':'';
  }
 }
 for(const item of items){
  const cell=document.createElement('div');cell.className='aia-gallery-cell';
  const button=thumb(item);
  const tick=document.createElement('span');tick.className='aia-gallery-tick';
  tick.hidden=true;tick.setAttribute('aria-hidden','true');
  button.append(tick);
  button.onclick=()=>{
   if(!selectionActive){if(item.id==='aia-jesus-approved')window.location.href='./fiches/jesus.html?v=13';else openImage(item);return}
   if(item.readOnly)return;
   if(selectedIds.has(item.id))selectedIds.delete(item.id);
   else selectedIds.add(item.id);
   update();
  };
  cell.append(button);grid.append(cell);cells.push({item,button,tick});
 }
 choose.onclick=()=>{
  selectionActive=!selectionActive;
  selectedIds.clear();
  update();
 };
 controlled(trash,async()=>{
  if(!selectionActive||!selectedIds.size)return;
  const targets=items.filter(item=>selectedIds.has(item.id));
  const place=theme?'du thème '+theme:'de '+category+' sous '+letter;
  if(!confirm('Supprimer '+targets.length+' image(s) '+place+' ?'))return;
  // Une seule transaction : toutes les suppressions réussissent ou aucune.
  const edits=targets.map(item=>{
   if(theme)return item.placements.length?{...item,topic:''}:null;
   const remaining=item.placements.filter(p=>!(p.category===category&&p.letter===letter));
   return remaining.length?{...item,placements:remaining}:null;
  });
  await operation('readwrite',store=>{
   edits.forEach((edit,i)=>{
    if(edit){
     store.put({id:edit.id,blob:edit.blob,label:edit.label,topic:edit.topic,
       subtheme:edit.subtheme||'',placements:edit.placements,links:Array.isArray(edit.links)?edit.links:[]});
    }else store.delete(targets[i].id);
   });
  });
  for(let i=0;i<targets.length;i++){
   const item=targets[i],index=records.findIndex(r=>r.id===item.id);
   if(index<0)continue;
   discard(records[index]);
   if(edits[i])records[index]=makeRecord(edits[i]);
   else records.splice(index,1);
  }
  refresh();
 });
 wrap.append(bar,grid);
 update();
 return wrap;
}
// La même ligne de commandes est utilisée dans chaque sous-dossier.
function toolbar(importButton,view){
 const row=document.createElement('div');
 row.className='aia-repertoire-toolbar';
 const controls=view.querySelector('.aia-gallery-selection-bar');
 if(!controls)throw new Error('Barre de sélection manquante');
 row.append(importButton,controls);
 return row;
}
// Sous-thèmes horizontaux pour chaque lettre de A à Z.
function normalized(text){
 return text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleUpperCase('fr-FR');
}
function startsWithLetter(text,letter){
 return normalized(text).startsWith(letter);
}
function existingSubtheme(item,letter){
 if(item.subtheme)return item.subtheme;
 if(item.topic){
  const short=item.topic.replace(/^(?:La |Le |Les |L’|L')/i,'');
  if(startsWithLetter(short,letter))return short;
 }
 return 'Autres';
}
function isUnder(item,category,letter){
 return item.placements.some(p=>p.category===category&&p.letter===letter);
}
function categoryView(category,letter){
 if(!categories.includes(category)||!letter)return;
 if(!ready){note('Ouverture du stockage…');return}
 const key=category+'|'+letter;
 const items=allFiches().filter(item=>isUnder(item,category,letter)&&item.id!=='aia-tract-jesus-jworg-t-jss');
 // Jésus est désormais présent dans sixApproved, sans vignette de secours.
 // Initialiser F avec les sous-thèmes déjà validés. Sur les autres lettres,
 // les noms sont créés par l'utilisateur ou issus des fiches existantes.
 // Les noms d'origine restent les identifiants : renommer n'altère aucune photo.
 const names=letter==='F'?['Famille','Foi']:[];
 for(const entry of customSubthemes){
  if(entry.category===category&&entry.letter===letter)names.push(entry.source||entry.name);
 }
 for(const item of items)names.push(existingSubtheme(item,letter));
 const unique=[...new Set(names)];
 const named=source=>{
  const entry=customSubthemes.find(e=>e.category===category&&e.letter===letter&&(e.source||e.name)===source);
  return entry?.name||source;
 };
 const previous=selectedSubtheme.get(key);
 const selected=unique.includes(previous)?previous:
  (unique.find(source=>named(source)===previous)||unique[0]||'');
 selectedSubtheme.set(key,selected);
 const wrap=document.createElement('div');wrap.className='aia-gallery-controls';
 const bar=document.createElement('div');
 bar.className='aia-subtheme-strip';
 bar.setAttribute('aria-label','Sous-thèmes sous '+letter);
 for(const name of unique){
  const button=makeButton(named(name),'aia-subtheme-tab');
  const active=name===selected;
  button.classList.toggle('selected',active);
  button.setAttribute('aria-pressed',String(active));
  button.onclick=()=>{selectedSubtheme.set(key,name);refresh()};
  bar.append(button);
 }
 const create=makeButton('+ Ajouter','aia-subtheme-add');
 create.onclick=async()=>{
  const response=prompt('Nouveau sous-thème sous '+letter+' :');
  if(response===null)return;
  const name=response.trim().replace(/\s+/g,' ').slice(0,45);
  if(!name){alert('Saisis un nom de sous-thème.');return}
  if(!startsWithLetter(name,letter)){
   alert('Choisis un sous-thème commençant par la lettre '+letter+'.');return;
  }
  const current=unique.find(x=>normalized(named(x))===normalized(name));
  if(current){selectedSubtheme.set(key,current);refresh();return}
  const entry={id:category+'|'+letter+'|'+normalized(name),category,letter,source:name,name};
  try{
   await operation('readwrite',store=>store.put(entry),extraStore);
   customSubthemes.push(entry);
   selectedSubtheme.set(key,name);
   refresh();
  }catch(error){alert('Enregistrement impossible : '+(error?.message||'erreur'))}
 };
 bar.append(create);
 const rename=makeButton('✎','aia-subtheme-rename');
 rename.setAttribute('aria-label',selected?'Renommer le sous-thème '+named(selected):'Renommer un sous-thème');
 rename.title=selected?'Renommer « '+named(selected)+' »':'Choisir un sous-thème';
 rename.disabled=!selected;
 rename.onclick=async()=>{
  if(!selected)return;
  const oldLabel=named(selected);
  const answer=prompt('Nouveau nom pour « '+oldLabel+' » :',oldLabel);
  if(answer===null)return;
  const name=answer.trim().replace(/\s+/g,' ').slice(0,45);
  if(!name){alert('Saisis un nom.');return}
  if(!startsWithLetter(name,letter)){
   alert('Le nom doit commencer par '+letter+' pour rester dans cette lettre.');return;
  }
  const collision=unique.find(source=>source!==selected&&normalized(named(source))===normalized(name));
  if(collision){alert('Ce sous-thème existe déjà dans '+category+' sous '+letter+'.');return}
  if(name===oldLabel)return;
  const previousEntry=customSubthemes.find(e=>e.category===category&&e.letter===letter&&(e.source||e.name)===selected);
  const updated=previousEntry?
   {...previousEntry,source:selected,name}:
   {id:'nom|'+category+'|'+letter+'|'+normalized(selected),category,letter,source:selected,name,kind:'renamed'};
  try{
   await operation('readwrite',store=>store.put(updated),extraStore);
   const index=customSubthemes.findIndex(e=>e.id===updated.id);
   if(index>=0)customSubthemes[index]=updated;else customSubthemes.push(updated);
   selectedSubtheme.set(key,selected);
   refresh();
  }catch(error){alert('Impossible de renommer : '+(error?.message||'erreur de stockage'))}
 };
 // Le crayon est désormais dans la ligne du titre TRACTS/FICHES,
 // jamais dans le défilement horizontal des sous-thèmes.
 const heading=area.querySelector(':scope > h3');
 if(heading){
  const headingRow=document.createElement('div');
  headingRow.className='aia-repertoire-header';
  heading.replaceWith(headingRow);
  headingRow.append(heading,rename);
 }
 wrap.append(bar);
 if(selected){
  const add=nativeImportLabel('Importer des images dans '+named(selected)+' sous '+letter);
  add.onclick=()=>{
   const topic=selected==='Famille'?'La famille'
    :topics.find(t=>normalized(t.replace(/^(?:La |Le |Les |L’|L')/i,''))===normalized(selected))||'';
   request={category,letter,topic,subtheme:selected};
   // Un seul fichier Jésus remplace le pilote pour TRACTS/J et THÈMES/Jésus.
   replaceId=(category==='TRACTS'&&letter==='J'&&selected==='Jésus')
    ?(records.find(item=>item.id==='aia-tract-jesus-jworg-t-jss')?.id||null):null;
   picker.multiple=!replaceId;
  };
  wrap.append(add);
 }else{
  const info=document.createElement('p');info.className='muted';
  info.textContent='Appuie sur + Ajouter pour créer ton premier sous-thème sous '+letter+'.';
  wrap.append(info);
 }
 area.querySelector('p.muted')?.remove();
 area.append(wrap);
 if(selected){
  const matches=items.filter(item=>existingSubtheme(item,letter)===selected);
  const view=gallery(matches,category,letter);
  const importButton=wrap.querySelector('.aia-import-button');
  if(importButton)wrap.append(toolbar(importButton,view));
  area.append(view);
 }
}
picker.addEventListener('change',async()=>{
 const files=Array.from(picker.files||[]);
 picker.value='';
 if(!files.length)return;
 const toReplace=replaceId;
 const target=request;
 replaceId=null;request=null;
 if(!db){alert('Stockage indisponible.');return}
 let invalid=0,errors=0,saved=0;
 for(const file of files){
  if(!allowed.has(file.type)||file.size>15*1024*1024){invalid++;continue}
  try{
   if(toReplace){
    const current=records.find(r=>r.id===toReplace);
    if(!current)throw new Error('Fiche introuvable');
    await save({...current,blob:file,label:labelFrom(file.name)});
   }else if(target){
    const placements=target.category==='THÈMES'?[]:[{category:target.category,letter:target.letter}];
    const item={id:crypto.randomUUID(),blob:file,label:labelFrom(file.name),
      topic:target.topic||'',subtheme:target.subtheme||'',placements};
    await save(item);
   }else return;
   saved++;
  }catch(error){errors++;console.error('AIA import : ',error)}
 }
 if(errors||invalid)alert(saved+' fiche(s) enregistrée(s). '+invalid+' format(s) ignoré(s), '+errors+' erreur(s) de stockage.');
});
function themeLabel(theme){
 const alias=customSubthemes.find(t=>t.category==='THÈMES'&&t.source===theme);
 return alias?.name||theme;
}
function renderTheme(theme){
 area.replaceChildren();
 const heading=document.createElement('h3');heading.textContent=themeLabel(theme);
 const headingRow=document.createElement('div');headingRow.className='aia-repertoire-header';
 const rename=makeButton('✎','aia-subtheme-rename');
 rename.setAttribute('aria-label','Renommer le thème '+themeLabel(theme));
 rename.title='Renommer « '+themeLabel(theme)+' »';
 rename.onclick=async()=>{
  const current=themeLabel(theme);
  const response=prompt('Nouveau nom pour « '+current+' » :',current);
  if(response===null)return;
  const newName=response.trim().replace(/\s+/g,' ').slice(0,45);
  if(!newName){alert('Saisis un nom.');return}
  const base=theme.replace(/^(?:La |Le |Les |L’|L')/i,'');
  const newBase=newName.replace(/^(?:La |Le |Les |L’|L')/i,'');
  if(!startsWithLetter(newBase,normalized(base).charAt(0))){
   alert('Le thème doit rester classé sous la même lettre.');return;
  }
  if(newName===current)return;
  const collision=topics.some(t=>t!==theme&&normalized(themeLabel(t))===normalized(newName));
  if(collision){alert('Un thème porte déjà ce nom.');return}
  const existing=customSubthemes.find(t=>t.category==='THÈMES'&&t.source===theme);
  const updated=existing?{...existing,name:newName}:{id:'theme-label|'+normalized(theme),category:'THÈMES',letter:'',source:theme,name:newName,kind:'theme-name'};
  try{
   await operation('readwrite',store=>store.put(updated),extraStore);
   const index=customSubthemes.findIndex(t=>t.id===updated.id);
   if(index>=0)customSubthemes[index]=updated;else customSubthemes.push(updated);
   refresh();
  }catch(error){alert('Renommage impossible : '+(error?.message||'erreur'))}
 };
 headingRow.append(heading,rename);
 const items=allFiches().filter(item=>item.topic===theme&&item.id!=='aia-tract-jesus-jworg-t-jss');
 // Jésus est désormais présent dans sixApproved, sans vignette de secours.
 const view=gallery(items,'','',theme);
 const add=nativeImportLabel('Importer des images dans le thème '+theme);
 add.onclick=()=>{
  request={category:'THÈMES',letter:'',topic:theme,subtheme:''};
  replaceId=null;picker.multiple=true;
 };
 area.append(headingRow,toolbar(add,view),view);
}
// Import validated PDF-derived image into the existing Repertoire storage.
// This bridge does not change or delete any existing record.
window.addEventListener('aia:save-pdf-fiche',async event=>{
 const detail=event.detail||{};
 try{
  if(!db||!ready)throw Error('Répertoire non prêt');
  if(!(detail.blob instanceof Blob)||!detail.blob.type.startsWith('image/'))throw Error('Image de fiche invalide');
  const topic=String(detail.topic||'').trim();
  if(!topics.includes(topic))throw Error('Thème non reconnu : choisis un thème existant');
  // Mettre à jour la fiche PDF déjà importée plutôt que garder son ancien PNG recadré.
  // Une correspondance exacte titre + thème seulement : préserver les autres fiches.
  const label=String(detail.label||topic).slice(0,100);
  const existing=records.find(item=>item.topic===topic&&item.label===label&&!item.readOnly);
  const item=existing
   ?{...existing,blob:detail.blob,references:Array.isArray(detail.references)?detail.references:existing.references}
   :{id:crypto.randomUUID(),blob:detail.blob,label,topic,subtheme:'',placements:[],links:[],references:Array.isArray(detail.references)?detail.references:[]};
  await save(item);
  window.dispatchEvent(new CustomEvent('aia:pdf-fiche-saved',{detail:{requestId:detail.requestId,id:item.id}}));
 }catch(error){
  window.dispatchEvent(new CustomEvent('aia:pdf-fiche-save-failed',{detail:{requestId:detail.requestId,message:error.message||'Erreur de stockage'}}));
 }
});
section.addEventListener('aia:index-render',e=>{
 activeTheme=null;
 const {category,letter}=e.detail||{};
 if(category==='THÈMES'){
  if(!ready)return;
  for(const tile of area.querySelectorAll('.aia-index-tile')){
   const name=tile.querySelector('strong')?.textContent;
   const item=allFiches().find(r=>r.topic===name)||null;
   const pic=tile.querySelector('.aia-index-placeholder');
   if(item&&pic){const img=document.createElement('img');img.src=item.url;img.alt='';img.className='aia-family-thumb';pic.replaceWith(img)}
   const title=tile.querySelector('strong');
   if(title&&name)title.textContent=themeLabel(name);
  }
  return;
 }
 categoryView(category,letter);
});
section.addEventListener('aia:theme-select',e=>{
 const theme=e.detail?.theme;
 if(!topics.includes(theme))return;
 e.preventDefault();
 activeTheme=theme;
 renderTheme(theme);
});
// Ne pas révoquer les blob: URLs ni fermer IndexedDB sur pagehide : Android
// peut conserver la page en cache de navigation (BFCache). Les URLs révoquées
// resteraient alors dans les vignettes et paraîtraient « disparues » au retour.
// Le navigateur libère ces ressources à la destruction effective du document.
window.addEventListener('pageshow',event=>{
 if(event.persisted){closeImage();refresh();}
});
(async()=>{
 try{
  db=await openDatabase();
  const stored=await operation('readonly',store=>store.getAll());
  const savedSubthemes=await operation('readonly',store=>store.getAll(),extraStore);
  for(const item of savedSubthemes){if(item?.name&&item?.category&&item?.letter)customSubthemes.push(item)}
  for(const raw of stored){
   if(raw&&raw.blob instanceof Blob&&Array.isArray(raw.placements)){
    if(raw.id==='aia-tract-jesus-jworg-t-jss'&&raw.topic!=='Jésus'){
     raw.topic='Jésus';
     try{await operation('readwrite',store=>store.put(raw))}catch(error){console.warn('AIA Jésus : classement différé',error)}
    }
    // Migration ciblée : un ancien import PDF « Souffrances » a été
    // rangé à tort dans L’avenir. Conserver l'image, les références et l'ID.
    // Ne jamais modifier les autres fiches ni leurs emplacements TRACTS/FICHES.
    if(raw.topic==='L’avenir'&&/^Une vie sans souffrances est-elle possible\s*\?$/i.test(String(raw.label||'').trim())){
     raw.topic='Les souffrances';
     try{await operation('readwrite',store=>store.put(raw))}
     catch(error){console.warn('AIA Souffrances : migration différée',error);raw.topic='L’avenir'}
    }
    records.push(makeRecord(raw));
   }
  }

 }catch(error){console.error('AIA IndexedDB : ',error);db=null}
 finally{ready=true;refresh()}
})();
})();
