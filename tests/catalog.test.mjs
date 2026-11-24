import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { demos, filterDemos } from '../data.js';

test('el catálogo enlaza las aplicaciones originales', () => {
  assert.deepEqual(demos.map(demo => demo.url), [
    'https://danidiazmenendez.github.io/fabrica-en-marcha-demo/',
    'https://danidiazmenendez.github.io/atlas-studio-demo/',
    'https://danidiazmenendez.github.io/pharma-agentic-3d/',
    'https://danidiazmenendez.github.io/gestion-documental-demo/',
    'https://danidiazmenendez.github.io/reporting-ai-hub-demo/'
  ]);
});

test('la búsqueda encuentra nombres y temas, sin distinguir tildes o mayúsculas', () => {
  assert.deepEqual(filterDemos('  DOCUGESTION ').map(demo => demo.id), ['documental']);
  assert.deepEqual(filterDemos('FARMACEUTICA').map(demo => demo.id), ['farmacia']);
  assert.deepEqual(filterDemos('atlas gobierno').map(demo => demo.id), ['atlas']);
  assert.deepEqual(filterDemos('reporting permisos').map(demo => demo.id), ['reporting']);
  assert.deepEqual(filterDemos('mantenimiento simulacion').map(demo => demo.id), ['fabrica']);
  assert.equal(filterDemos('sin resultados').length, 0);
  assert.equal(filterDemos('  ').length, demos.length);
});

test('cada ficha tiene una captura local de la aplicación', async () => {
  for (const demo of demos) await access(new URL(`../${demo.preview}`, import.meta.url));
});

test('el acceso es un enlace directo, no un recorrido interno o una aplicación incrustada', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const script = await readFile(new URL('../app.js', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /<dialog|<iframe/i);
  assert.doesNotMatch(script, /showModal|renderExperience|data-next|data-decision/);
  assert.match(script, /href="\$\{escapeHtml\(demo\.url\)\}"/);
  assert.match(script, /target="_blank" rel="noopener noreferrer"/);
});
