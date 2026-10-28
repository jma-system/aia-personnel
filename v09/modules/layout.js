/* Présentation V09 inspirée de la maquette. Aucune connexion IA ni accès dossier simulés. */
(() => {
 const home=document.getElementById('home');
 if(!home || home.querySelector('.aia-workflow'))return;
 const paths={
 book:'M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3z M12 6v15',
 users:'M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M3 21v-4a6 6 0 0 1 12 0v4 M17 5a3 3 0 0 1 0 6 M18 14a5 5 0 0 1 3 4v3',
 file:'M5 2h9l5 5v15H5z M14 2v6h5 M8 12h8 M8 16h8',
 save:'M3 3h16l2 2v16H3z M7 3v6h10V3 M7 21v-8h10v8',
 spark:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z',
 globe:'M2 12h20 M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20 M12 2c-6 5-6 15 0 20 6-5 6-15 0-20',
 video:'M3 4h18v16H3z M10 8l6 4-6 4z',
 folder:'M2 6h8l2 3h10v12H2z M2 6V3h8l2 3',
 index:'M4 3h16v18H4z M8 3v18 M12 8h5 M12 12h5 M12 16h5',
 mic:'M9 4a3 3 0 0 1 6 0v8a3 3 0 0 1-6 0z M5 10v2a7 7 0 0 0 14 0v-2 M12 19v3 M8 22h8',
 search:'M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16 M16 16l6 6'};
 function icon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.7');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.classList.add('aia-icon');const p=document.createElementNS(svg.namespaceURI,'path');p.setAttribute('d',paths[name]);svg.append(p);return svg;}
 function decorate(el,name,label){el.replaceChildren(icon(name),document.createTextNode(label));}
 decorate(document.getElementById('cvm'),'book','CVM');decorate(document.getElementById('tg'),'users','TG');
 for(const [id,label,name] of [['f-Tract','Tract','file'],['f-Fiche','Fiche','file'],['f-Étude','Étude','book']])decorate(document.getElementById(id),name,label);
 const save=home.querySelector('[onclick="saveSelection()"]'),create=home.querySelector('[onclick="createFromQueue()"]');
 decorate(save,'save','Enregistrer');decorate(create,'spark','Création');
 const subject=document.getElementById('subject'),subjectLabel=subject.previousElementSibling,formatRow=document.getElementById('f-Fiche').parentElement,formatLabel=formatRow.previousElementSibling,actions=save.parentElement,queueInfo=document.getElementById('queueInfo');
 const workflow=document.createElement('div');workflow.className='aia-workflow';
 home.insertBefore(workflow,subjectLabel);workflow.append(subjectLabel,subject,formatLabel,formatRow,actions,queueInfo);
 const oldLibrary=home.querySelector('[onclick="openLibrary()"]'),video=home.querySelector('[onclick="openDesk()"]'),oldActions=oldLibrary.parentElement;
 oldLibrary.className='small aia-test-library';oldLibrary.textContent='Fiches de test';workflow.append(oldLibrary);
 const search=document.createElement('section');search.className='aia-search-panel';search.setAttribute('aria-label','Recherche multi-IA — non connectée');
 const top=document.createElement('div');top.className='aia-search-heading';const title=document.createElement('strong');title.textContent='Recherche multi-IA';
 const select=document.createElement('select');select.disabled=true;select.setAttribute('aria-label','IA — connexion à préparer');for(const name of ['ChatGPT','Claude','Gemini','DeepSeek']){const op=document.createElement('option');op.textContent=name;select.append(op)}top.append(title,select);
 const row=document.createElement('div');row.className='aia-search-row';const input=document.createElement('input');input.disabled=true;input.placeholder='Pose ta question…';input.setAttribute('aria-label','Question — connexion IA à préparer');const mic=document.createElement('button');mic.type='button';mic.disabled=true;mic.setAttribute('aria-label','Microphone — compatibilité à vérifier');mic.append(icon('mic'));row.append(input,mic);
 const pending=document.createElement('p');pending.className='muted';pending.textContent='Connexion IA à préparer.';search.append(top,row,pending);
 const quick=document.createElement('div');quick.className='aia-quick-access';
 const jw=document.createElement('a');jw.href='https://www.jw.org/fr/';jw.target='_blank';jw.rel='noopener noreferrer';decorate(jw,'globe','JW.org');
 decorate(video,'video','Vidéos');document.querySelector('#desk h2').textContent='Vidéos';
 function folder(label,name){const b=document.createElement('button');b.type='button';b.disabled=true;b.title='Dossier externe à choisir';decorate(b,name,label);return b}
 const wol=document.createElement('a');wol.href='https://wol.jw.org/fr/wol/h/r30/lp-f';wol.target='_blank';wol.rel='noopener noreferrer';decorate(wol,'book','WOL');
 quick.append(jw,wol,video,folder('Mes fiches','folder'),folder('Index','index'));
 const hint=document.createElement('p');hint.className='muted aia-folder-hint';hint.textContent='Mes fiches et Index : dossiers PDF à choisir.';
 oldActions.remove();home.append(search,quick,hint);
})();

