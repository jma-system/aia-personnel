#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const data=JSON.parse(fs.readFileSync('v09-test/data/cvm-2026-11-30.json','utf8'));
assert.equal(data.schema,1);
assert.equal(data.start,'2026-11-30');assert.equal(data.end,'2026-12-06');
assert.equal(data.source,'https://wol.jw.org/fr/wol/d/r30/lp-f/202026405');
assert.equal(data.tasks.length,8);
assert.deepEqual(data.tasks.map(x=>x.number),[1,2,3,4,5,6,7,8]);
assert.deepEqual(data.tasks.map(x=>x.title),[
'Suivons le rythme du char céleste de Jéhovah','Perles spirituelles','Lecture de la Bible',
'Engage la conversation','Fais des disciples','Discours',"Besoins de l’assemblée",'Étude biblique de l’assemblée']);
const html=fs.readFileSync('v09-test/test-cvm-jwpub.html','utf8');
assert.match(html,/id="loadOfficial"/);
assert.match(html,/\.\/data\/cvm-2026-11-30\.json\?v=1/);
assert.match(html,/Array\.isArray\(week\.verifiedTasks\)/);
assert.match(html,/loadOfficial\(\);/);
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
for(const [,js] of scripts)if(js.trim())new vm.Script(js);
console.log('PASS: programme officiel, 8 sujets, affichage CVM sans JWPUB, JS valide.');
console.log('LIMIT: affichage Android et création du brouillon non encore testés sur téléphone.');
