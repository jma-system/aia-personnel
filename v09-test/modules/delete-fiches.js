/* AIA V09-test — suppression explicite, jamais automatique. */
(() => {
'use strict';
const panel=document.getElementById('exportPanel');
const viewer=document.getElementById('viewer');
if(!panel||!viewer)return;
const actions=panel.querySelector('.actions');
const del=document.createElement('button');
del.type='button';del.textContent='Supprimer la sélection';
del.style.cssText='color:#a21b1b;border-color:#a21b1b';
actions.append(del);
function erase(ids){
 const items=docs.filter(d=>ids.has(d.id));
 if(!items.length){message('Sélectionne une ou plusieurs fiches.');return}
 const names=items.map(d=>'• '+d.title).join('\n');
 if(!window.confirm('Supprimer définitivement '+items.length+' fiche(s) de ce navigateur ?\n\n'+names+'\n\nLes PDF déjà enregistrés dans Drive ne seront pas supprimés.'))return;
 const backup=docs.slice();
 docs=docs.filter(d=>!ids.has(d.id));
 if(!persist()){docs=backup;return}
 current=Math.min(current,Math.max(0,docs.length-1));
 selected.clear();
 if(typeof renderExportList==='function')renderExportList();
 if(typeof openLibrary==='function')openLibrary();
 message(items.length+' fiche(s) supprimée(s) de AIA. Les PDF Drive sont conservés.');
}
del.addEventListener('click',()=>erase(new Set(selected)));
const individual=document.createElement('button');
individual.type='button';individual.textContent='Supprimer cette fiche';
individual.style.cssText='color:#a21b1b;border-color:#a21b1b';
viewer.querySelector('.actions').append(individual);
individual.addEventListener('click',()=>{
 const d=docs[current];if(d)erase(new Set([d.id]));
});
})();
