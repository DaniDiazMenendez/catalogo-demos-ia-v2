import { experiences } from './data.js';

const grid = document.querySelector('#catalog-grid');
const filters = document.querySelector('#filters');
const search = document.querySelector('#search');
const dialog = document.querySelector('#experience-dialog');
const content = document.querySelector('#experience-content');
let category = 'Todas';
let current = null;
let stepIndex = 0;
let selectedDecision = null;
let returnFocus = null;

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

function renderFilters() {
  const categories = ['Todas', ...new Set(experiences.map((item) => item.category))];
  filters.innerHTML = categories.map((item) => `<button class="filter ${item === category ? 'active' : ''}" type="button" data-filter="${escapeHtml(item)}" aria-pressed="${item === category}">${escapeHtml(item)}</button>`).join('');
}

function renderCatalog() {
  const query = search.value.trim().toLocaleLowerCase('es');
  const visible = experiences.filter((item) => {
    const text = `${item.title} ${item.subtitle} ${item.summary} ${item.category}`.toLocaleLowerCase('es');
    return (category === 'Todas' || item.category === category) && text.includes(query);
  });
  document.querySelector('#results-count').textContent = `${visible.length} ${visible.length === 1 ? 'EXPERIENCIA' : 'EXPERIENCIAS'}`;
  document.querySelector('#empty').hidden = visible.length > 0;
  grid.innerHTML = visible.map((item) => `
    <article class="experience-card">
      <button class="card-button" type="button" data-open="${escapeHtml(item.id)}" aria-label="Explorar ${escapeHtml(item.subtitle)}">
        <div class="card-art ${escapeHtml(item.color)}"><span class="card-category">${escapeHtml(item.category)}</span><span class="art-symbol">${escapeHtml(item.icon)}</span><span class="card-art-number">${escapeHtml(item.number)} / 06</span><span class="card-art-arrow">↗</span></div>
        <div class="card-content"><span class="card-subtitle">${escapeHtml(item.subtitle)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p><span class="card-link">Explorar experiencia <span>→</span></span></div>
      </button>
    </article>`).join('');
}

function renderExperience() {
  const item = current;
  const step = item.steps[stepIndex];
  content.innerHTML = `
    <div class="dialog-top"><a class="dialog-brand" href="#inicio">✳ <strong>demo</strong>lab <span>/ EXPERIENCIA</span></a><button type="button" class="close-button" data-close aria-label="Cerrar experiencia">✕</button></div>
    <div class="dialog-body">
      <div class="dialog-intro">
        <div><p class="dialog-category">${escapeHtml(item.category)} · ${escapeHtml(item.subtitle)}</p><h2 id="dialog-title">${escapeHtml(item.title)}</h2><p class="dialog-summary">${escapeHtml(item.context)}</p></div>
        <div class="dialog-brief"><span>LA PREGUNTA</span><strong>${escapeHtml(item.challenge)}</strong><small>${escapeHtml(item.persona)}</small></div>
      </div>
      <div class="simulation-note"><strong>SIMULACIÓN INTERACTIVA</strong> · Datos ficticios y respuestas predefinidas. Sin IA ni integraciones activas. No ingreses información sensible.</div>
      <div class="experience-layout">
        <div class="story-panel">
          <div class="panel-heading"><span>RECORRIDO DEL CASO</span><span>${String(stepIndex + 1).padStart(2, '0')} / ${String(item.steps.length).padStart(2, '0')}</span></div>
          <div class="step-nav" role="group" aria-label="Etapas del recorrido">${item.steps.map((entry, index) => `<button type="button" data-step="${index}" class="${index === stepIndex ? 'selected' : ''}" ${index === stepIndex ? 'aria-current="step"' : ''}><span>${index + 1}</span> ${escapeHtml(entry.label)}</button>`).join('')}</div>
          <div class="stage" aria-live="polite"><div class="stage-icon ${escapeHtml(item.color)}">${escapeHtml(item.icon)}</div><div class="stage-content"><span>ETAPA ${stepIndex + 1}</span><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.body)}</p><div class="evidence">◈ &nbsp; ${escapeHtml(step.evidence)}</div>${stepIndex === item.steps.length - 1 ? `<div class="decision-options"><span>EXPLORÁ UNA DECISIÓN</span>${item.decisions.map((decision, index) => `<button type="button" data-decision="${index}" aria-pressed="${selectedDecision === index}">${escapeHtml(decision.label)}</button>`).join('')}${selectedDecision !== null ? `<p class="decision-outcome">${escapeHtml(item.decisions[selectedDecision].outcome)}</p>` : ''}</div>` : ''}<button type="button" class="button button-dark stage-button" data-next>${escapeHtml(step.action)} <span>→</span></button></div></div>
        </div>
        <aside class="insight-panel"><div class="insight-head"><span class="insight-icon">✳</span><div><strong>Asistencia en contexto</strong><small>RESPUESTA DE EJEMPLO · NO ES IA EN VIVO</small></div></div><p>${escapeHtml(step.insight)}</p><div class="insight-footer">✦ &nbsp; Diseñada para acompañar, no reemplazar el criterio humano.</div></aside>
      </div>
      <div class="metrics-row">${item.metrics.map((metric) => `<div><strong>${escapeHtml(metric.value)}</strong><span>${escapeHtml(metric.label)}</span></div>`).join('')}</div>
      <section class="architecture"><div class="architecture-heading"><div><span>DE LA EXPERIENCIA A LA TECNOLOGÍA</span><h3>Arquitectura de referencia</h3></div><p>Una manera posible de conectar las piezas. No representa una implementación desplegada.</p></div><div class="architecture-flow">${item.architecture.map((entry, index) => `<div class="architecture-piece"><span>0${index + 1}</span><strong>${escapeHtml(entry)}</strong></div>`).join('<span class="flow-arrow" aria-hidden="true">→</span>')}</div><p class="architecture-note">${escapeHtml(item.architectureNote)} Identidad, seguridad, evaluación, costos y observabilidad requieren diseño específico.</p></section>
      <div class="dialog-end"><div><span>SIGUIENTE CONVERSACIÓN</span><p>${escapeHtml(item.next)}</p></div>${item.existing ? `<a class="button button-dark" href="${escapeHtml(item.existing.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.existing.label)} ↗</a>` : ''}</div>
    </div>`;
}

function openExperience(id, updateLocation = true) {
  const found = experiences.find((item) => item.id === id);
  if (!found) return;
  returnFocus = document.activeElement;
  current = found;
  stepIndex = 0;
  selectedDecision = null;
  renderExperience();
  if (!dialog.open) dialog.showModal();
  if (updateLocation) history.pushState({experience:id}, '', `#demo-${encodeURIComponent(id)}`);
}

filters.addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  category = button.dataset.filter;
  renderFilters();
  renderCatalog();
  filters.querySelector(`[data-filter="${CSS.escape(category)}"]`).focus();
});
search.addEventListener('input', renderCatalog);
grid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-open]');
  if (button) openExperience(button.dataset.open);
});
content.addEventListener('click', (event) => {
  if (event.target.closest('[data-close]')) {
    dialog.close();
  } else if (event.target.closest('[data-next]')) {
    stepIndex = (stepIndex + 1) % current.steps.length;
    if (stepIndex === 0) selectedDecision = null;
    renderExperience();
    content.querySelector('[data-next]').focus({preventScroll:true});
  } else if (event.target.closest('[data-decision]')) {
    selectedDecision = Number(event.target.closest('[data-decision]').dataset.decision);
    renderExperience();
    content.querySelector(`[data-decision="${selectedDecision}"]`).focus({preventScroll:true});
  } else {
    const button = event.target.closest('[data-step]');
    if (button) {
      stepIndex = Number(button.dataset.step);
      renderExperience();
      content.querySelector(`[data-step="${stepIndex}"]`).focus({preventScroll:true});
    }
  }
});
dialog.addEventListener('close', () => {
  if (location.hash.startsWith('#demo-')) history.replaceState(null, '', '#experiencias');
  if (returnFocus && returnFocus.isConnected) returnFocus.focus();
});
window.addEventListener('popstate', () => {
  const id = location.hash.startsWith('#demo-') ? decodeURIComponent(location.hash.slice(6)) : null;
  if (id && experiences.some((item) => item.id === id)) openExperience(id, false);
  else if (dialog.open) dialog.close();
});

renderFilters();
renderCatalog();
if (location.hash.startsWith('#demo-')) openExperience(decodeURIComponent(location.hash.slice(6)), false);
