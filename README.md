# Catálogo de demos IA · V2

Un punto de acceso en español a las aplicaciones originales de ATLAS Studio, Pharma, DocuGestión y Reporting & AI Hub. El catálogo no recrea, incrusta ni modifica las demos: cada enlace abre la aplicación original en una nueva pestaña, con su diseño, sus colores, sus interacciones y su arquitectura.

## Alcance

Solo incluye demos existentes con enlaces directos y capturas reales de sus pantallas. No contiene recorridos recreados, asistentes propios ni integraciones de IA. Cada aplicación documenta su alcance y sus límites por separado. La aplicación específica del cliente queda excluida y el catálogo original permanece sin cambios.

La guía es un personaje 3D estilizado con pelo ondulado y blazer, renderizado en el navegador con Three.js (`avatar.js`), no un video de una persona ni una animación de la captura de referencia. El modelo base de Grab3D es CC0 y su autor lo declara asistido por IA. Se le agregaron 20 poses faciales propias para articular, parpadear y acompañar la bienvenida. Lee únicamente el título y el párrafo de presentación mediante la síntesis de voz del navegador (`voice.js`). Utiliza iluminación de retrato y parpadeos a intervalos variables. La boca enlaza poses de articulación en español y respeta las pausas de puntuación (`speech-motion.js`), en lugar de repetir una apertura periódica. Los eventos de palabra ajustan el tiempo a la voz cuando están disponibles; sin ellos se utiliza una estimación del texto, no sincronización fonética exacta. Los gestos de cabeza acompañan algunas palabras de la bienvenida. No es un chat, no usa micrófono ni reproduce audio automáticamente. El botón permite iniciar, detener y repetir la presentación.

La simulación no utiliza recursos de una suscripción de Azure, claves ni servicios de avatar. La voz depende de las opciones en español del navegador o del sistema (algunas pueden necesitar Internet); se prefiere Elena de Argentina cuando está disponible. El modelo 3D y el motor se sirven desde el propio sitio; la descarga del modelo optimizado es de aproximadamente 4,6 MB. Requiere WebGL 2 y un navegador moderno con descompresión gzip. Si falla la animación, se muestra un retrato estático y un aviso; el audio y el catálogo siguen disponibles. Se respeta la preferencia de reducir movimiento para parpadeos y cabeza. Licencias y procedencia en `THIRD_PARTY_NOTICES.txt`.

Para regenerar la versión optimizada, descargar el GLB rigged indicado en los créditos y ejecutar `node scripts/prepare-avatar.mjs <ruta-del-GLB>`. El script conserva el rig de cabeza, recorta la geometría que queda fuera del retrato y agrega las poses faciales. La compilación versiona el modelo y el retrato por contenido para evitar mostrar un personaje anterior desde caché.

## Ejecutar y mantener

Ejecutar `npm ci`, `npm run build` y `python -m http.server 8000 --directory dist`, y abrir `http://localhost:8000`. La publicación resultante es estática y no requiere servidor de aplicaciones. Para añadir una demo publicada, agregar su ficha y URL original en `data.js` y una captura en `previews`. La interfaz y estilos están en `app.js`, `index.html` y `style.css`. La búsqueda admite nombres, industrias y temas, con o sin tildes.

Ejecutar `node --test tests/*.test.mjs` para verificar búsqueda, enlaces, ausencia de recorridos internos y versionado de archivos publicados.

El workflow de GitHub Actions ejecuta las pruebas y `node build.mjs` y publica `dist` en GitHub Pages al actualizar `main`. Los nombres de los módulos y estilos publicados incluyen una huella de su contenido, para que las actualizaciones del catálogo no reutilicen datos viejos de la caché. Para previsualizar la publicación, ejecutar `node build.mjs` y `python -m http.server 8000 --directory dist`. En la configuración del repositorio, seleccionar GitHub Actions como origen de Pages.
