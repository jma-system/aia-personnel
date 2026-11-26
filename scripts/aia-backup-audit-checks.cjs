#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {validate}=require('../v09-test/modules/repertoire-backup-audit.js');
const imageData='data:image/png;base64,iVBORw0KGgo=';
const doc={schema:'aia-repertoire-export-v1',source:'aia-repertoire-v09-test',exportedAt:'2026-11-26T21:00:00Z',subthemes:[],items:[{id:'one',label:'Fiche test',topic:'Jésus',placements:[],references:[],imageData}]};
assert.equal(validate(doc).ok,true);
assert.equal(validate({...doc,items:[doc.items[0],doc.items[0]]}).ok,false);
assert.equal(validate({...doc,items:[{...doc.items[0],imageData:'invalid'}]}).ok,false);
assert.equal(validate({...doc,schema:'bad'}).ok,false);
assert.equal(validate({...doc,items:[{...doc.items[0],placements:null}]}).ok,false);
const page=fs.readFileSync('v09-test/test-restauration-sans-risque.html','utf8');
const lib=fs.readFileSync('v09-test/modules/repertoire-backup-audit.js','utf8');
assert.match(page,/repertoire-backup-audit\.js/);
assert.doesNotMatch(page+lib,/indexedDB|localStorage|\.put\(|\.delete\(|fetch\(/,'Never access or modify AIA stored data');
console.log('PASS backup shape validation, duplicate detection, invalid image detection, no storage I/O.');
console.log('LIMIT: a real backup and real browser restore are not tested.');
