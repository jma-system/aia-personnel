#!/usr/bin/env node
// AIA PDF / repertoire: zero-dependency CI smoke checks. No browser data is touched.
const fs=require('node:fs');
const cp=require('node:child_process');
const files=['v09-test/modules/fiches-pdf-import-v17.js','v09-test/modules/import-image-test.js','v09-test/modules/index-interactif.js','v09-test/index.html'];
let failures=0;
function check(ok,msg){console.log((ok?'PASS ':'FAIL ')+msg);if(!ok)failures++}
for(const f of files)check(fs.existsSync(f),'Required file '+f);
if(failures)process.exit(1);
for(const f of files.filter(x=>x.endsWith('.js'))){
 const p=cp.spawnSync(process.execPath,['--check',f],{encoding:'utf8'});
 check(p.status===0,'JavaScript syntax '+f);
 if(p.status!==0)console.error(p.stderr);
}
const pdf=fs.readFileSync(files[0],'utf8');
const img=fs.readFileSync(files[1],'utf8');
const html=fs.readFileSync(files[3],'utf8');
check(pdf.includes('getDocument('),'PDF document reader exists');
check(pdf.includes('numPages'),'PDF page count validation exists');
check(pdf.includes('extractTract('),'Generic tract extraction entry point exists');
check(pdf.includes('parsedReferences('),'Reference parsing entry point exists');
check(pdf.includes('Conversion impossible'),'PDF failures reported to user');
check(pdf.includes('Aucun enregistrement automatique'),'PDF preview does not claim automatic saving');
check(img.includes('indexedDB.open('),'Repertoire storage path exists');
check(img.includes('aia-repertoire-native-picker'),'Android native picker path exists');
check(img.includes('store.put('),'Repertoire persistence path exists');
check(html.includes('fiches-pdf-import-v17.js'),'PDF importer referenced in HTML');
check(html.includes('import-image-test.js'),'Image importer referenced in HTML');
const suspicious=[...pdf.matchAll(/(?:\.click\(\)|setTimeout\(\(\)=>picker\.remove\(\))/g)].length;
console.log('INFO PDF importer contains '+suspicious+' potentially fragile picker interaction(s) — manual Android test required.');
console.log('INFO These static checks cannot prove PDF extraction accuracy, clickable Bible references, QR decoding, backup recovery, or Android UI behavior.');
if(failures){console.error(failures+' check(s) failed');process.exit(1)}
console.log('Static checks passed.');
