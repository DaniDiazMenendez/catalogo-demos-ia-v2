export const demos = [
  {
    id: 'fabrica',
    name: 'Fábrica en marcha',
    category: 'Manufactura · Continuidad operativa',
    description: 'Una planta interactiva para anticipar una parada: evidencia de mantenimiento, repuestos, alternativas y su impacto calculado en los pedidos. Incluye arquitectura de referencia.',
    tags: ['Mantenimiento', 'Simulación', 'Arquitectura'],
    url: 'https://danidiazmenendez.github.io/fabrica-en-marcha-demo/',
    preview: 'previews/fabrica.jpg',
    previewAlt: 'Aplicación original de Fábrica en marcha: planta industrial 3D con cinco estaciones y panel para iniciar el incidente.',
    accent: 'fabrica'
  },
  {
    id: 'operador',
    name: 'Operador 5.0 · Arquitectura y perfiles',
    category: 'Manufactura · Arquitectura y perfiles',
    description: 'Una copia independiente de la presentación: planta interactiva, arquitectura técnica y perfiles con sus roles y permisos. Sin mockup ni recorrido de la app.',
    tags: ['Arquitectura', 'Perfiles', 'Roles y permisos'],
    url: 'https://danidiazmenendez.github.io/operador5-arquitectura-perfiles/',
    preview: 'previews/operador.jpg',
    previewAlt: 'Arquitectura de referencia de Operador 5.0: capas y componentes sobre la planta original, en la copia sin mockup.',
    accent: 'operador'
  },
  {
    id: 'atlas',
    name: 'ATLAS Studio',
    category: 'Desarrollo y productividad',
    description: 'Una fábrica corporativa de soluciones: crear prototipos con IA, explorar distintos modos de trabajo y recorrer su evolución gobernada.',
    tags: ['Desarrollo con IA', 'Gobierno', 'Arquitectura'],
    url: 'https://danidiazmenendez.github.io/atlas-studio-demo/',
    preview: 'previews/atlas.jpg',
    previewAlt: 'Pantalla original de ATLAS Studio: navegación azul oscuro, espacio de trabajo y proyectos.',
    accent: 'atlas'
  },
  {
    id: 'farmacia',
    name: 'Pharma · Del pedido a la entrega',
    category: 'Industria farmacéutica',
    description: 'La cadena farmacéutica en una historia 3D: personas, agentes y decisiones, desde el pedido hasta la entrega, con su mapa técnico.',
    tags: ['Historia 3D', 'Agentes', 'Mapa técnico'],
    url: 'https://danidiazmenendez.github.io/pharma-agentic-3d/',
    preview: 'previews/farmacia.jpg',
    previewAlt: 'Pantalla original de Pharma: planta 3D, recorrido del pedido y aplicación del equipo.',
    accent: 'pharma'
  },
  {
    id: 'documental',
    name: 'DocuGestión',
    category: 'Gestión documental · Transversal',
    description: 'La aplicación de gestión documental: documentos, carga, validación, búsqueda inteligente, auditoría y su vista de arquitectura.',
    tags: ['Documentos', 'Validación', 'Búsqueda inteligente'],
    url: 'https://danidiazmenendez.github.io/gestion-documental-demo/',
    preview: 'previews/documental.jpg',
    previewAlt: 'Panel original de DocuGestión: indicadores, documentos pendientes y actividad reciente.',
    accent: 'documental'
  },
  {
    id: 'reporting',
    name: 'Reporting & AI Hub · Demo POC',
    category: 'Analítica y reporting · Transversal',
    description: 'Un hub de reportes con asistente de IA, acceso por roles y simulador de permisos. Incluye vistas de arquitectura actual e ideal y seguridad.',
    tags: ['Reportes', 'Asistente de IA', 'Roles y permisos'],
    url: 'https://danidiazmenendez.github.io/reporting-ai-hub-demo/',
    preview: 'previews/reporting.jpg',
    previewAlt: 'Pantalla original de Reporting & AI Hub: inicio del usuario simulado, reportes disponibles y navegación de arquitectura y seguridad.',
    accent: 'reporting'
  }
];

export function filterDemos(query) {
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
  const terms = normalize(query.trim()).split(/\s+/).filter(Boolean);
  return demos.filter(demo => {
    const text = normalize([demo.name, demo.category, demo.description, ...demo.tags].join(' '));
    return terms.every(term => text.includes(term));
  });
}
