# Catálogo de demos IA · V2

Un punto de acceso en español a las aplicaciones originales de ATLAS Studio, Pharma, DocuGestión y Reporting & AI Hub. El catálogo no recrea, incrusta ni modifica las demos: cada enlace abre la aplicación original en una nueva pestaña, con su diseño, sus colores, sus interacciones y su arquitectura.

## Alcance

Solo incluye demos existentes con enlaces directos y capturas reales de sus pantallas. No contiene recorridos recreados, asistentes propios ni integraciones de IA. Cada aplicación documenta su alcance y sus límites por separado. La aplicación específica del cliente queda excluida y el catálogo original permanece sin cambios.

La guía es un personaje humano 3D renderizado en el navegador con Three.js (`avatar.js`), no un video de una persona. Lee únicamente el título y el párrafo de presentación mediante la síntesis de voz del navegador (`voice.js`). Utiliza iluminación de retrato con sombras suaves, reflejos en los ojos, mirada sutil y parpadeos a intervalos variables. La boca enlaza poses de articulación en español y respeta las pausas de puntuación (`speech-motion.js`), en lugar de repetir una apertura periódica. Los eventos de palabra ajustan el tiempo a la voz cuando están disponibles; sin ellos se utiliza una estimación del texto, no sincronización fonética exacta. Los gestos de cabeza acompañan algunas palabras de la bienvenida. No es un chat, no usa micrófono ni reproduce audio automáticamente. El botón permite iniciar, detener y repetir la presentación.

La simulación no utiliza recursos de una suscripción de Azure, claves ni servicios de avatar. La voz depende de las opciones en español del navegador o del sistema (algunas pueden necesitar Internet). El modelo 3D y el motor se sirven desde el propio sitio; la descarga del modelo optimizado es de aproximadamente 5–6 MB. Requiere WebGL 2 y un navegador moderno con descompresión gzip. Si falla la animación, se muestra un retrato estático y un aviso; el audio y el catálogo siguen disponibles. Se respeta la preferencia de reducir movimiento para parpadeos y cabeza. Licencias y procedencia en `THIRD_PARTY_NOTICES.txt`.

## Ejecutar y mantener

Ejecutar `npm ci`, `npm run build` y `python -m http.server 8000 --directory dist`, y abrir `http://localhost:8000`. La publicación resultante es estática y no requiere servidor de aplicaciones. Para añadir una demo publicada, agregar su ficha y URL original en `data.js` y una captura en `previews`. La interfaz y estilos están en `app.js`, `index.html` y `style.css`. La búsqueda admite nombres, industrias y temas, con o sin tildes.

Ejecutar `node --test tests/*.test.mjs` para verificar búsqueda, enlaces, ausencia de recorridos internos y versionado de archivos publicados.

El workflow de GitHub Actions ejecuta las pruebas y `node build.mjs` y publica `dist` en GitHub Pages al actualizar `main`. Los nombres de los módulos y estilos publicados incluyen una huella de su contenido, para que las actualizaciones del catálogo no reutilicen datos viejos de la caché. Para previsualizar la publicación, ejecutar `node build.mjs` y `python -m http.server 8000 --directory dist`. En la configuración del repositorio, seleccionar GitHub Actions como origen de Pages.
