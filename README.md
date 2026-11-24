# Catálogo de demos IA · V2

Un punto de acceso en español a las aplicaciones originales de ATLAS Studio, Pharma, DocuGestión y Reporting & AI Hub. El catálogo no recrea, incrusta ni modifica las demos: cada enlace abre la aplicación original en una nueva pestaña, con su diseño, sus colores, sus interacciones y su arquitectura.

## Alcance

Solo incluye demos existentes con enlaces directos y capturas reales de sus pantallas. No contiene recorridos recreados, asistentes propios ni integraciones de IA. Cada aplicación documenta su alcance y sus límites por separado. La aplicación específica del cliente queda excluida y el catálogo original permanece sin cambios.

## Ejecutar y mantener

Servir la carpeta con cualquier servidor web estático, por ejemplo `python -m http.server 8000`, y abrir `http://localhost:8000`. No requiere instalación ni compilación. Para añadir una demo publicada, agregar su ficha y URL original en `data.js` y una captura en `previews`. La interfaz y estilos están en `app.js`, `index.html` y `style.css`. La búsqueda admite nombres, industrias y temas, con o sin tildes.

Ejecutar `node --test tests/catalog.test.mjs` para verificar búsqueda, enlaces y ausencia de recorridos internos.

El workflow de GitHub Actions publica la carpeta en GitHub Pages al actualizar `main`. En la configuración del repositorio, seleccionar GitHub Actions como origen de Pages.
