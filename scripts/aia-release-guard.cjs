#!/usr/bin/env node
// AIA release guard: static smoke checks only. Does not publish or write browser storage.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
let failures = 0;
const check = (condition, name) => {
  console.log((condition ? 'PASS' : 'FAIL') + ' ' + name);
  if (!condition) failures++;
};
const root = 'v09-test';
const htmlPath = path.join(root, 'index.html');
check(fs.existsSync(htmlPath), 'AIA entrypoint exists');
if (!fs.existsSync(htmlPath)) process.exit(1);
const html = fs.readFileSync(htmlPath, 'utf8');
const moduleDir = path.join(root, 'modules');
check(fs.existsSync(moduleDir), 'AIA modules directory exists');
if (!fs.existsSync(moduleDir)) process.exit(1);
const scripts = fs.readdirSync(moduleDir).filter(name => name.endsWith('.js'));
check(scripts.length > 0, 'JavaScript modules found');
for (const filename of scripts) {
  const script = path.join(moduleDir, filename);
  const result = cp.spawnSync(process.execPath, ['--check', script], {encoding: 'utf8'});
  check(result.status === 0, 'JavaScript syntax: ' + filename);
  if (result.status !== 0) console.error(result.stderr || result.error);
}
for (const match of html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)) {
  const src = match[1].split(/[?#]/)[0];
  if (/^(https?:)?\/\//i.test(src)) continue; // CDN: needs separate runtime verification.
  if (!src || src.startsWith('/') || src.includes('..')) {
    check(false, 'Safe local script path: ' + src);
    continue;
  }
  check(fs.existsSync(path.join(root, src)), 'Referenced script exists: ' + src);
}
for (const name of ['fiches-pdf-import-v17.js', 'import-image-test.js']) {
  check(html.includes(name), 'Active importer referenced: ' + name);
}
for (const id of ['home', 'viewer']) {
  check(new RegExp('\\bid\\s*=\\s*["\x27]' + id + '["\x27]').test(html), 'Required UI element: ' + id);
}
const indexJs = fs.readFileSync(path.join(moduleDir, 'index-interactif.js'), 'utf8');
check(/section\\.id\\s*=\\s*['"]indexPanel['"]/.test(indexJs), 'Dynamically created indexPanel exists');
console.log('NOTE: Static checks do not prove mobile layout, Bible links, QR codes, PDF fidelity, persistence or service-worker cache behavior.');
if (failures) { console.error(failures + ' check(s) failed.'); process.exit(1); }
console.log('AIA static release guard passed.');
