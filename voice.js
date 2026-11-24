export function initVoiceGuide({ button, label, symbol, status, text }, speech, Utterance) {
  let active = null;
  const idleMessage = 'Voz del navegador · sin micrófono.';

  function reset(message) {
    active = null;
    button.setAttribute('aria-pressed', 'false');
    label.textContent = 'Escuchar presentación';
    symbol.textContent = '▶';
    status.textContent = message;
  }

  function stop() {
    if (!active) return;
    reset(idleMessage);
    speech.cancel();
  }

  if (!speech || !Utterance) {
    status.textContent = 'Este navegador no admite lectura en voz alta. Podés leer la presentación arriba.';
    button.disabled = true;
    return stop;
  }

  button.disabled = false;
  status.textContent = idleMessage;
  button.addEventListener('click', () => {
    if (active) {
      stop();
      return;
    }

    const voices = speech.getVoices();
    const spanish = voices.filter(voice => /^es(?:[-_]|$)/i.test(voice.lang));
    if (voices.length && !spanish.length) {
      status.textContent = 'No hay una voz en español disponible. Instalá una voz en español o probá con otro navegador.';
      return;
    }

    const utterance = new Utterance(text);
    const voice = spanish.find(voice => /^es[-_]AR$/i.test(voice.lang) && /Elena/i.test(voice.name || ''))
      || spanish.find(voice => /^es[-_]AR$/i.test(voice.lang))
      || spanish.find(voice => voice.localService)
      || spanish[0];
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || 'es-AR';
    utterance.rate = 1;
    active = utterance;
    button.setAttribute('aria-pressed', 'true');
    label.textContent = 'Detener audio';
    symbol.textContent = '■';
    status.textContent = 'Preparando la voz…';

    utterance.onstart = () => {
      if (active !== utterance) return;
      status.textContent = 'Reproduciendo la presentación.';
    };
    utterance.onend = () => {
      if (active === utterance) reset('Presentación finalizada. Podés volver a escucharla.');
    };
    utterance.onerror = event => {
      if (active !== utterance) return;
      console.error('No se pudo reproducir la presentación:', event.error);
      reset('No se pudo reproducir el audio. Volvé a intentarlo o probá con otro navegador.');
    };
    try {
      speech.speak(utterance);
    } catch (error) {
      console.error('No se pudo iniciar la presentación:', error);
      reset('No se pudo iniciar el audio. Volvé a intentarlo o probá con otro navegador.');
    }
  });
  return stop;
}
