import { filterDemos } from './data.js';
import { initVoiceGuide } from './voice.js';

const grid = document.querySelector('#catalog-grid');
const search = document.querySelector('#search');
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

function renderCatalog() {
  const visible = filterDemos(search.value);
  document.querySelector('#results-count').textContent = `${visible.length} ${visible.length === 1 ? 'demo disponible' : 'demos disponibles'}`;
  document.querySelector('#empty').hidden = visible.length > 0;
  grid.innerHTML = visible.map(demo => `
    <article class="demo-card ${escapeHtml(demo.accent)}">
      <a class="demo-link" href="${escapeHtml(demo.url)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${escapeHtml(demo.name)} en otra pestaña">
        <div class="preview"><img src="${escapeHtml(demo.preview)}" alt="${escapeHtml(demo.previewAlt)}" width="1440" height="900"></div>
        <div class="card-content">
          <p class="category">${escapeHtml(demo.category)}</p>
          <h2>${escapeHtml(demo.name)}</h2>
          <p class="description">${escapeHtml(demo.description)}</p>
          <ul class="tags" aria-label="Temas">${demo.tags.map(tag => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>
          <span class="open-link">Abrir demo original <span aria-hidden="true">↗</span></span>
        </div>
      </a>
    </article>`).join('');
}

search.addEventListener('input', renderCatalog);
renderCatalog();

let presenter;
let speaking = false;
let currentWord;
const introduction = `${document.querySelector('#page-title').textContent} ${document.querySelector('#intro-description').textContent}`;
import('./avatar.js').then(async ({ initAvatar3D }) => {
  presenter = await initAvatar3D(document.querySelector('#voice-avatar'));
  presenter.setSpeaking(speaking, introduction);
  if (speaking && currentWord) presenter.setWord(currentWord.word, currentWord.index);
  document.querySelector('#avatar-status').textContent = 'Simulación 3D · movimiento labial aproximado.';
}).catch(error => {
  console.error('No se pudo cargar el avatar 3D:', error);
  document.querySelector('#avatar-status').textContent = 'La animación 3D no está disponible. Podés escuchar el audio igualmente.';
});

const stopVoice = initVoiceGuide({
  button: document.querySelector('#voice-toggle'),
  label: document.querySelector('#voice-label'),
  symbol: document.querySelector('#voice-symbol'),
  status: document.querySelector('#voice-status'),
  avatar: document.querySelector('#voice-avatar'),
  text: introduction,
  onSpeakingChange(value) {
    speaking = value;
    currentWord = undefined;
    presenter?.setSpeaking(value, introduction);
  },
  onWord(word, index) {
    currentWord = { word, index };
    presenter?.setWord(word, index);
  }
}, window.speechSynthesis, window.SpeechSynthesisUtterance);
window.addEventListener('pagehide', stopVoice);
