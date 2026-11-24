# Catálogo de demos IA · V2

Un punto de acceso en español a las aplicaciones originales de Fábrica en marcha, ATLAS Studio, Pharma, DocuGestión y Reporting & AI Hub. El catálogo no recrea, incrusta ni modifica las demos: cada enlace abre la aplicación original en una nueva pestaña, con su diseño, sus colores, sus interacciones y su arquitectura.

Fábrica en marcha es una aplicación independiente de manufactura y continuidad operativa, con una escena industrial original, cinco estaciones, decisiones con impacto calculado sobre pedidos y arquitectura de referencia. Sus datos, documentos y asistencia son simulados; no reutiliza la app, el código ni los mockups de un cliente.

## Alcance

Solo incluye demos existentes con enlaces directos y capturas reales de sus pantallas. No contiene recorridos recreados, asistentes propios ni integraciones de IA. Cada aplicación documenta su alcance y sus límites por separado. La aplicación específica del cliente queda excluida y el catálogo original permanece sin cambios.

El botón «Escuchar presentación» lee únicamente el título y el párrafo de bienvenida mediante la síntesis de voz del navegador (`voice.js`). Permite iniciar, detener y repetir el audio; no es un chat, no usa micrófono ni reproduce automáticamente. Se retiró el avatar 3D porque su animación labial aproximada no ofrecía la sincronización esperada. No se descargan modelos, imágenes de personajes ni motores 3D.

La narración no utiliza recursos de una suscripción de Azure ni claves. La voz depende de las opciones en español del navegador o del sistema (algunas pueden necesitar Internet); se prefiere Elena de Argentina cuando está disponible. Si no hay compatibilidad o falla el audio, se muestra un aviso y el catálogo sigue disponible.

## Ejecutar y mantener

Ejecutar `npm run build` y `python -m http.server 8000 --directory dist`, y abrir `http://localhost:8000`. No requiere instalar dependencias. La publicación resultante es estática y no requiere servidor de aplicaciones. Para añadir una demo publicada, agregar su ficha y URL original en `data.js` y una captura en `previews`. La interfaz y estilos están en `app.js`, `index.html` y `style.css`. La búsqueda admite nombres, industrias y temas, con o sin tildes.

Ejecutar `node --test tests/*.test.mjs` para verificar búsqueda, enlaces, ausencia de recorridos internos y versionado de archivos publicados.

El workflow de GitHub Actions ejecuta las pruebas y `node build.mjs` y publica `dist` en GitHub Pages al actualizar `main`. Cada compilación reemplaza el contenido generado de `dist` para no conservar recursos retirados. Los nombres de los módulos y estilos publicados incluyen una huella de su contenido, para que las actualizaciones del catálogo no reutilicen datos viejos de la caché. Para previsualizar la publicación, ejecutar `node build.mjs` y `python -m http.server 8000 --directory dist`. En la configuración del repositorio, seleccionar GitHub Actions como origen de Pages.
