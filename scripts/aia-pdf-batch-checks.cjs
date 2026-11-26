#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const path='v09-test/modules/pdf-batch-pilot.js',html='v09-test/test-import-pdf-groupe.html';
const js=fs.readFileSync(path,'utf8'),page=fs.readFileSync(html,'utf8');
const syntax=cp.spawnSync(process.execPath,['--check',path],{encoding:'utf8'});
assert.equal(syntax.status,0,syntax.stderr);
assert.match(page,/type="file"[^>]+multiple/);
assert.match(page,/modules\/pdf-batch-pilot\.js/);
assert.match(js,/MAX_FILES=10/);
assert.match(js,/MAX_SIZE=20\*1024\*1024/);
assert.match(js,/for\(const file of files\)/);
assert.match(js,/await file\.arrayBuffer\(\)/);
assert.match(js,/await first\.render\(/);
assert.doesNotMatch(js,/indexedDB|localStorage|\.put\(|\.delete\(|fetch\(|sendBeacon/);
console.log('PASS multi-PDF pilot isolated, syntax valid, independent checks, no storage writes.');
console.log('LIMIT: Android multi-select and visual fidelity must be tested on a real device.');
