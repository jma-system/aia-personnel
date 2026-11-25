/* AIA — signets de session, sans localStorage/sessionStorage/IndexedDB. 
   Le nom de l'onglet permet de conserver la sélection lors de la navigation interne. */
(()=>{'use strict';
const prefix='AIA_SIGNETS_V1:';
function read(){try{const s=window.name||'';return s.startsWith(prefix)?JSON.parse(s.slice(prefix.length)):[]}catch(_){return []}}
function write(ids){window.name=prefix+JSON.stringify(ids);window.dispatchEvent(new Event('aia:bookmarks-changed'))}
const api={
 ids:()=>read(),
 has:id=>read().includes(String(id)),
 toggle:id=>{id=String(id);const ids=read();const i=ids.indexOf(id);if(i>=0)ids.splice(i,1);else ids.push(id);write(ids);return i<0},
 remove:id=>{write(read().filter(x=>x!==String(id)))}
};
window.AIABookmarks=api;
})();