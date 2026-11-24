const vowels = { a: ['aa', 0.62], e: ['E', 0.46], i: ['I', 0.36], o: ['O', 0.58], u: ['U', 0.5] };
const consonants = {
  b: 'PP', m: 'PP', p: 'PP', v: 'PP', f: 'FF',
  t: 'DD', d: 'DD', n: 'nn', l: 'nn', r: 'RR', rr: 'RR',
  s: 'SS', z: 'SS', x: 'SS', ch: 'CH', ll: 'I', y: 'I',
  k: 'kk', q: 'kk', qu: 'kk', gu: 'kk', j: 'kk'
};

export function createSpeechMotion(text) {
  const cues = [];
  let duration = 0;
  for (const match of text.matchAll(/ch|ll|rr|qu|gu(?=[eiéí])|[a-záéíóúüñ]|[.,;:!?]|\s/giu)) {
    const token = match[0].toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let shape;
    let strength = 0;
    let length = 25;
    if (vowels[token]) {
      [shape, strength] = vowels[token];
      length = 90;
    } else if (/[.,;:!?]/.test(token)) {
      length = /[.!?]/.test(token) ? 330 : 160;
    } else if (token !== 'h' && !/\s/.test(token)) {
      const next = text[match.index + 1] || '';
      shape = token === 'c' ? (/[eiéí]/i.test(next) ? 'SS' : 'kk')
        : token === 'g' ? 'kk' : consonants[token] || 'nn';
      strength = shape === 'PP' ? 0.82 : 0.4;
      length = shape === 'SS' || shape === 'CH' ? 85 : 60;
    }
    cues.push({ index: match.index, start: duration, end: duration + length, shape, strength });
    duration += length;
  }
  let active = false;
  let anchorTime = 0;
  let anchorOffset = 0;
  let speed = 1;
  let previousBoundary;

  return {
    start(now) {
      active = true;
      anchorTime = now;
      anchorOffset = 0;
      speed = 1;
      previousBoundary = undefined;
    },
    stop() { active = false; },
    syncWord(index, now) {
      if (!active) return;
      const cue = cues.find(item => item.index >= index);
      if (!cue || (previousBoundary && index <= previousBoundary.index)) return;
      if (previousBoundary && now - previousBoundary.time > 80) {
        const observed = (cue.start - previousBoundary.offset) / (now - previousBoundary.time);
        speed = speed * 0.6 + Math.min(1.8, Math.max(0.65, observed)) * 0.4;
      }
      anchorTime = now;
      anchorOffset = cue.start;
      previousBoundary = { index, time: now, offset: cue.start };
    },
    sample(now) {
      if (!active) return {};
      const elapsed = anchorOffset + (now - anchorTime) * speed;
      const index = cues.findIndex(cue => elapsed >= cue.start && elapsed < cue.end);
      if (index < 0) return {};
      const cue = cues[index];
      const next = cues[index + 1];
      const blend = Math.max(0, 1 - (cue.end - elapsed) / Math.min(45, (cue.end - cue.start) * 0.5)) * 0.4;
      const weights = {};
      if (cue.shape) weights[`viseme_${cue.shape}`] = cue.strength * (1 - blend);
      if (next?.shape) weights[`viseme_${next.shape}`] = (weights[`viseme_${next.shape}`] || 0) + next.strength * blend;
      return weights;
    }
  };
}
