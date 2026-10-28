/* AIA V09-test : sélection et actions uniques dans Mes fiches. */
(() => {
'use strict';
const library=document.getElementById('library');
if(!library)return;
const list=document.getElementById('list');
const selectedIds=new Set();
const toolbar=document.createElement('div');toolbar.className='no-print';
toolbar.innerHTML='<div class="row" style="margin:12px 0"><button type="button" id="aia-select-all">Tout sélectionner</button><button type="button" id="aia-select-none">Tout désélectionner</button></div><p id="aia-selected-count" class="muted">0 fiche sélectionnée</p><div class="actions"><button type="button" id="aia-save-selected" class="primary">Enregistrer en PDF</button><button type="button" id="aia-delete-selected" style="color:#a21b1b;border-color:#a21b1b">Supprimer</button></div>';
list.after(toolbar);
const existingActions=library.querySelector('.actions');
if(existingActions)existingActions.querySelectorAll('button').forEach(b=>{if(b.getAttribute('onclick')==='openExport()')b.style.display='none'});
function count(){const n=selectedIds.size;document.getElementById('aia-selected-count').textContent=n+' fiche'+(n>1?'s':'')+' sélectionnée'+(n>1?'s':'')}
function render(){
 const rows=[...list.children];rows.forEach((row,i)=>{
  const d=docs[i];if(!d)return;
  let checkbox=row.querySelector('input[data-aia-select]');
  if(!checkbox){
   checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.dataset.aiaSelect='1';checkbox.style.cssText='width:23px;height:23px;flex:0 0 23px;margin-right:8px';
   checkbox.setAttribute('aria-label','Sélectionner '+d.title);
   row.prepend(checkbox);
  }
  checkbox.checked=selectedIds.has(d.id);
  checkbox.onchange=()=>{if(checkbox.checked)selectedIds.add(d.id);else selectedIds.delete(d.id);count()};
 });count();
}
const oldOpen=window.openLibrary;
window.openLibrary=function(){oldOpen();render()};
document.getElementById('aia-select-all').onclick=()=>{docs.forEach(d=>selectedIds.add(d.id));render()};
document.getElementById('aia-select-none').onclick=()=>{selectedIds.clear();render()};
document.getElementById('aia-save-selected').onclick=()=>{
 const ids=[...selectedIds];
 if(!ids.length)return message('Sélectionne au moins une fiche.');
 const unvalidated=docs.filter(d=>selectedIds.has(d.id)&&!d.validated);
 if(unvalidated.length)return message('Valide les fiches sélectionnées avant de créer leur PDF.');
 selected=new Set(ids);
 renderExportList();
 show('exportPanel');
};
document.getElementById('aia-delete-selected').onclick=()=>{
 const items=docs.filter(d=>selectedIds.has(d.id));
 if(!items.length)return message('Sélectionne au moins une fiche.');
 if(!confirm('Supprimer définitivement '+items.length+' fiche(s) de AIA ?\n\n'+items.map(d=>'• '+d.title).join('\n')+'\n\nLes PDF déjà enregistrés dans Drive resteront intacts.'))return;
 const backup=docs.slice();docs=docs.filter(d=>!selectedIds.has(d.id));
 if(!persist()){docs=backup;return}
 selectedIds.clear();current=Math.min(current,Math.max(0,docs.length-1));
 window.openLibrary();message(items.length+' fiche(s) supprimée(s).');
};
})();
