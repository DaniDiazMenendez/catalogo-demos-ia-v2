import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { initVoiceGuide } from '../voice.js';

const text = 'Cada demo, su propia experiencia. Un solo lugar para encontrarlas. Abrí cada aplicación con su diseño, sus colores, sus interacciones y su arquitectura de referencia originales.';
function setup(voices = [{ lang: 'es-AR', localService: true }]) {
  const button = new EventTarget();
  button.disabled = true;
  const attributes = new Map();
  button.setAttribute = (name, value) => attributes.set(name, value);
  const elements = {
    button, text,
    label: {}, symbol: {}, status: {}
  };
  const spoken = [];
  let cancellations = 0;
  const speech = {
    getVoices: () => voices,
    speak: utterance => spoken.push(utterance),
    cancel: () => { cancellations++; }
  };
  class Utterance { constructor(value) { this.text = value; } }
  return { elements, speech, Utterance, spoken, attributes, cancelCount: () => cancellations, click: () => button.dispatchEvent(new Event('click')) };
}

test('lee solo la presentación visible, sin reproducción automática, y permite repetir', async () => {
  const page = await readFile('index.html', 'utf8');
  const visible = `${page.match(/id="page-title">([^<]+)</)[1]} ${page.match(/id="intro-description">([^<]+)</)[1]}`;
  assert.equal(visible, text);
  const state = setup([
    { lang: 'es-AR', name: 'Microsoft Tomas Online' },
    { lang: 'es-AR', name: 'Microsoft Elena Online' }
  ]);
  initVoiceGuide(state.elements, state.speech, state.Utterance);
  assert.equal(state.spoken.length, 0);
  state.click();
  assert.equal(state.spoken[0].text, visible);
  assert.equal(state.spoken[0].lang, 'es-AR');
  assert.equal(state.spoken[0].voice.name, 'Microsoft Elena Online');
  state.spoken[0].onstart();
  assert.equal(state.elements.status.textContent, 'Reproduciendo la presentación.');
  state.spoken[0].onend();
  assert.match(state.elements.status.textContent, /finalizada/);
  assert.equal(state.attributes.get('aria-pressed'), 'false');
  state.click();
  assert.equal(state.spoken.length, 2);
});

test('detener cancela la narración e ignora eventos de una reproducción anterior', () => {
  const state = setup();
  const stop = initVoiceGuide(state.elements, state.speech, state.Utterance);
  state.click();
  const previous = state.spoken[0];
  state.click();
  assert.equal(state.cancelCount(), 1);
  state.click();
  previous.onend();
  assert.equal(state.attributes.get('aria-pressed'), 'true');
  stop();
  assert.equal(state.cancelCount(), 2);
  assert.equal(state.attributes.get('aria-pressed'), 'false');
});

test('informa falta de compatibilidad o de voz española sin intentar reproducir', () => {
  const unsupported = setup();
  initVoiceGuide(unsupported.elements, undefined, undefined);
  assert.equal(unsupported.elements.button.disabled, true);
  assert.match(unsupported.elements.status.textContent, /no admite/);
  const noSpanish = setup([{ lang: 'en-US' }]);
  initVoiceGuide(noSpanish.elements, noSpanish.speech, noSpanish.Utterance);
  noSpanish.click();
  assert.equal(noSpanish.spoken.length, 0);
  assert.match(noSpanish.elements.status.textContent, /No hay una voz en español/);
});

test('los errores de audio dejan el control listo para reintentar', t => {
  const logged = t.mock.method(console, 'error', () => {});
  const state = setup();
  initVoiceGuide(state.elements, state.speech, state.Utterance);
  state.click();
  state.spoken[0].onstart();
  state.spoken[0].onerror({ error: 'synthesis-failed' });
  assert.equal(state.attributes.get('aria-pressed'), 'false');
  assert.match(state.elements.status.textContent, /No se pudo reproducir/);
  assert.equal(logged.mock.calls.length, 1);
  state.click();
  assert.equal(state.spoken.length, 2);
});
