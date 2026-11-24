# Catálogo de demos IA · V2

Un punto de acceso en español a las aplicaciones originales de ATLAS Studio, Pharma, DocuGestión y Reporting & AI Hub. El catálogo no recrea, incrusta ni modifica las demos: cada enlace abre la aplicación original en una nueva pestaña, con su diseño, sus colores, sus interacciones y su arquitectura.

## Alcance

Solo incluye demos existentes con enlaces directos y capturas reales de sus pantallas. No contiene recorridos recreados, asistentes propios ni integraciones de IA. Cada aplicación documenta su alcance y sus límites por separado. La aplicación específica del cliente queda excluida y el catálogo original permanece sin cambios.

El avatar ilustrado permite escuchar únicamente el título y el párrafo de presentación con la síntesis de voz del navegador (`voice.js`). No es un chat, no usa micrófono ni reproduce audio automáticamente. El botón permite iniciar, detener y repetir la presentación. La disponibilidad y el sonido dependen de las voces en español del navegador o del sistema; los errores o la falta de compatibilidad se muestran junto al botón. La animación es ilustrativa, no sincronización labial fonética.

## Ejecutar y mantener

Servir la carpeta con cualquier servidor web estático, por ejemplo `python -m http.server 8000`, y abrir `http://localhost:8000`. No requiere instalación ni compilación. Para añadir una demo publicada, agregar su ficha y URL original en `data.js` y una captura en `previews`. La interfaz y estilos están en `app.js`, `index.html` y `style.css`. La búsqueda admite nombres, industrias y temas, con o sin tildes.

Ejecutar `node --test tests/*.test.mjs` para verificar búsqueda, enlaces, ausencia de recorridos internos y versionado de archivos publicados.

El workflow de GitHub Actions ejecuta las pruebas y `node build.mjs` y publica `dist` en GitHub Pages al actualizar `main`. Los nombres de los módulos y estilos publicados incluyen una huella de su contenido, para que las actualizaciones del catálogo no reutilicen datos viejos de la caché. Para previsualizar la publicación, ejecutar `node build.mjs` y `python -m http.server 8000 --directory dist`. En la configuración del repositorio, seleccionar GitHub Actions como origen de Pages.
