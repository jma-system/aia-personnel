/* AIA PDF original — parseur pilote (liste volontairement limitée). */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.AIAPdfBible=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const books={
    'matthieu':{id:40,slug:'Matthieu',chapters:28},
    'jean':{id:43,slug:'Jean',chapters:21},
    'psaume':{id:19,slug:'Psaumes',chapters:150},
    'psaumes':{id:19,slug:'Psaumes',chapters:150},
    'jacques':{id:59,slug:'Jacques',chapters:5},
    'revelation':{id:66,slug:'R%C3%A9v%C3%A9lation',chapters:22},
    '2 timothee':{id:55,slug:'2-timoth%C3%A9e',chapters:4}
  };
  function parse(text){
    const raw=String(text||'').trim();
    const normalized=raw.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
    const match=normalized.match(/(?:^|[^a-z])((?:2\s+timothee)|matthieu|jean|psaumes?|jacques|revelation)\s+(\d{1,3})\s*:\s*(\d{1,3})(?:\s*[-–,]\s*\d{1,3})?(?=$|[^\d])/);
    if(!match)return null;
    const book=books[match[1].replace(/\s+/g,' ')];
    const chapter=Number(match[2]),verse=Number(match[3]);
    if(!book||chapter<1||chapter>book.chapters||verse<1||verse>176)return null;
    const anchor='v'+String(book.id).padStart(2,'0')+String(chapter).padStart(3,'0')+String(verse).padStart(3,'0');
    return {reference:match[0].trim(),url:'https://www.jw.org/fr/biblioth%C3%A8que/bible/nwt/livres/'+book.slug+'/'+chapter+'/#'+anchor};
  }
  return {parse};
});
