# Demo Lab · Catálogo V2

Catálogo en español de experiencias de negocio para Latinoamérica. Incluye seis recorridos interactivos breves y enlaces a las demos existentes de gestión documental, farmacia y ATLAS Studio.

## Alcance

Los seis recorridos son **simulaciones estáticas** con datos ficticios y respuestas predefinidas: no usan IA en vivo, no suben archivos, no envían mensajes ni se conectan a servicios. Las arquitecturas son propuestas de referencia, no despliegues existentes. Las decisiones sensibles requieren validación humana y, cuando corresponda, profesional o regulatoria. No ingresar información sensible.

Los enlaces a otras experiencias llevan a sitios independientes cuyo alcance debe revisarse por separado. Se excluye la aplicación específica del cliente.

## Ejecutar y mantener

Servir la carpeta con cualquier servidor web estático, por ejemplo `python -m http.server 8000`, y abrir `http://localhost:8000`. No requiere instalación ni compilación. Para añadir o modificar una experiencia, editar `data.js`; la interfaz y estilos están en `app.js`, `index.html` y `style.css`.

El workflow de GitHub Actions publica la carpeta en GitHub Pages al actualizar `main`. En la configuración del repositorio, seleccionar GitHub Actions como origen de Pages.
