#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const parser=require('../v09-test/modules/pdf-original-references.js');
const pilot=fs.readFileSync('v09-test/modules/pdf-original-pilot.js','utf8');
const page=fs.readFileSync('v09-test/test-pdf-original.html','utf8');
const cases=[
 ['Matthieu 7:12','v40007012'],
 ['Jean 13:34, 35','v43013034'],
 ['Psaume 34:17-19','v19034017'],
 ['Jacques 1:13','v59001013'],
 ['Révélation 21:4','v66021004'],
 ['2 Timothée 3:16, 17','v55003016']
];
for(const [input,anchor] of cases){
 const result=parser.parse(input);
 assert.ok(result,input);
 assert.ok(result.url.includes('jw.org/fr/')&&result.url.endsWith('#'+anchor),input);
 console.log('PASS '+input);
}
for(const input of ['texte sans référence','Jean 99:1','Matthieu 1:0','2 Timothée 999:3'])assert.equal(parser.parse(input),null,input);
assert.ok(pilot.includes('await file.arrayBuffer()'),'Original file read');
assert.ok(pilot.includes('new Blob([original],{type:\'application/pdf\'})'),'Original PDF downloadable unchanged');
assert.ok(pilot.includes('page.render('),'Original page rendered');
assert.ok(pilot.includes('overlay.append(a)'),'Link overlays separate from canvas');
assert.ok(!pilot.includes('indexedDB')&&!pilot.includes('localStorage'),'No browser persistence');
assert.ok(page.includes('modules/pdf-original-pilot.js')&&page.includes('modules/pdf-original-references.js'));
console.log('PASS isolated original PDF pilot contract');
console.log('LIMIT: render fidelity and hyperlink positions need real PDF Android tests.');
