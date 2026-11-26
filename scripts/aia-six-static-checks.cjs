#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('v09-test/modules/import-image-test.js','utf8');
new vm.Script(js);
const start=js.indexOf('const sixApproved='),end=js.indexOf('// Fiches locales conservées',start);
assert(start>0&&end>start,'Six catalog entries must exist');
const code=js.slice(start,end).replace('const sixApproved=','(').replace(/;\s*$/,' )');
const items=vm.runInNewContext(code);
assert.equal(items.length,6);
assert.equal(new Set(items.map(x=>x.id)).size,6);
const required=['avenir','dieu','famille','jesus','priere','royaume'];
for(const name of required){
 const item=items.find(i=>i.id==='aia-approved-'+name);
 assert(item,'Missing '+name);
 assert.equal(item.readOnly,true);
 assert(item.url.endsWith('/'+(name==='famille'?'famille-restauree':name==='priere'?'priere-restauree':name+'-restaure')+'.webp'));
 assert(fs.existsSync('v09-test/'+item.url.replace(/^\.\//,'')),'Missing image '+item.url);
 assert(Array.isArray(item.placements));
}
assert.match(js,/if\(item\.readOnly\)return;/,'Static items cannot be deleted');
assert.match(js,/r\.topic===approved\.topic/,'Deduplication by topic');
assert.doesNotMatch(js,/items\.unshift\(jesusApproved\)/,'No legacy duplicate Jesus card');
console.log('PASS six read-only fiche assets, distinct IDs, paths, no overwrite, no legacy duplicate.');
console.log('LIMIT: Android display and Bible hitboxes still require on-device testing.');
