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

const stopVoice = initVoiceGuide({
  button: document.querySelector('#voice-toggle'),
  label: document.querySelector('#voice-label'),
  symbol: document.querySelector('#voice-symbol'),
  status: document.querySelector('#voice-status'),
  text: `${document.querySelector('#page-title').textContent} ${document.querySelector('#intro-description').textContent}`
}, window.speechSynthesis, window.SpeechSynthesisUtterance);
window.addEventListener('pagehide', stopVoice);
