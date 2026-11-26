#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),cp=require('node:child_process');
const modulePath='v09-test/modules/repertoire-backup-export.js';
const source=fs.readFileSync(modulePath,'utf8');
const html=fs.readFileSync('v09-test/index.html','utf8');
const check=cp.spawnSync(process.execPath,['--check',modulePath],{encoding:'utf8'});
assert.equal(check.status,0,check.stderr);
assert.match(html,/modules\/repertoire-backup-export\.js/);
assert.match(source,/db\.transaction\(name,'readonly'\)/,'Only read-only transactions');
assert.doesNotMatch(source,/\.put\(|\.delete\(|\.clear\(|'readwrite'|localStorage\.setItem/,'No writes or deletions');
assert.match(source,/aia-repertoire-v09-test/);
assert.match(source,/aia-repertoire-export-v1/);
assert.match(source,/readAsDataURL\(blob\)/);
assert.match(source,/URL\.createObjectURL\(file\)/);
assert.doesNotMatch(source,/fetch\(|XMLHttpRequest|sendBeacon/,'No outbound upload');
console.log('PASS Repertoire export module: syntax, hookup, read-only and no external upload.');
console.log('LIMIT: actual Android download, completeness and restore remain untested.');
