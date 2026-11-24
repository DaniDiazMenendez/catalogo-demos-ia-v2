import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpeechMotion } from '../speech-motion.js';

test('la articulación cierra los labios en p y enlaza suavemente con la vocal', () => {
  const motion = createSpeechMotion('pa');
  motion.start(100);
  assert.ok(motion.sample(120).viseme_PP > 0.7);
  const transition = motion.sample(159);
  assert.ok(transition.viseme_PP > 0 && transition.viseme_PP < 0.7);
  assert.ok(transition.viseme_aa > 0);
  assert.ok(motion.sample(180).viseme_aa > 0.5);
  assert.equal(motion.sample(180).viseme_PP, undefined);
});

test('respeta pausas y no repite los movimientos cuando termina el texto', () => {
  const motion = createSpeechMotion('a. a');
  assert.deepEqual(motion.sample(0), {});
  motion.start(0);
  assert.ok(motion.sample(20).viseme_aa > 0);
  assert.deepEqual(motion.sample(200), {});
  assert.ok(motion.sample(465).viseme_aa > 0);
  assert.deepEqual(motion.sample(10000), {});
  motion.stop();
  assert.deepEqual(motion.sample(20), {});
});

test('los eventos de palabra corrigen el tiempo y detener o repetir reinicia la articulación', () => {
  const motion = createSpeechMotion('cielo queso');
  motion.start(0);
  assert.ok(motion.sample(20).viseme_SS > 0);
  motion.syncWord(6, 1000);
  assert.ok(motion.sample(1020).viseme_kk > 0);
  motion.syncWord(0, 1000);
  assert.ok(motion.sample(1020).viseme_kk > 0);
  motion.stop();
  motion.syncWord(6, 2000);
  assert.deepEqual(motion.sample(2020), {});
  motion.start(3000);
  assert.ok(motion.sample(3020).viseme_SS > 0);
});
