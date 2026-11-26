#!/usr/bin/env node
// Tests du parseur biblique réellement utilisé par l'import PDF AIA.
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('v09-test/modules/fiches-pdf-import-v17.js', 'utf8');
const start = source.indexOf('function parsedReferences(raw){');
const end = source.indexOf('function extractTract(', start);
assert.ok(start >= 0 && end > start, 'Fonction de lecture des références introuvable');
const context = vm.createContext({});
vm.runInContext(source.slice(start, end), context, {timeout: 1000});
const cases = [
  ['Matthieu 7:12', 40, 7, 12],
  ['Jean 13:34, 35', 43, 13, 34],
  ['Révélation 21:4', 66, 21, 4],
  ['Psaume 34:17-19', 19, 34, 17],
  ['2 Timothée 3:16, 17', 55, 3, 16],
  ['Jacques 1:13', 59, 1, 13]
];
for (const [label, book, chapter, verse] of cases) {
  const found = context.parsedReferences(label);
  assert.equal(found.length, 1, 'Une référence attendue : ' + label);
  assert.deepEqual([found[0].book, found[0].chapter, found[0].verse], [book, chapter, verse], label);
  console.log('PASS ' + label);
}
assert.equal(context.parsedReferences('texte sans référence').length, 0, 'Ne pas créer de lien sans référence');
console.log('PASS Aucun lien inventé sans référence');
console.log('LIMITES : ne teste ni les 66 livres, ni l’ouverture réelle des liens JW.org, ni les plages de versets.');
