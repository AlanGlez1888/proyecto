# Frontend (Vue) — proyecto de red social

Este es el arranque del frontend en Vue 3 + Vite, con páginas de ejemplo
(datos falsos, sin conexión al backend todavía).

## Cómo correrlo

1. Instala Node.js (versión 18 o más reciente).
2. Abre esta carpeta en una terminal.
3. Instala las dependencias:
   ```
   npm install
   ```
4. Levanta el servidor de desarrollo:
   ```
   npm run dev
   ```
5. Abre la URL que muestra la terminal (normalmente http://localhost:5173).

## Qué incluye

- `/` — Muro de opiniones (feed)
- `/login` — Iniciar sesión
- `/registro` — Crear cuenta
- `/maestros` — Buscar maestros
- `/maestros/:id` — Perfil de un maestro con sus comentarios
- `/marketplace` — Marketplace estudiantil de materiales
- `/admin` — Panel de administración con métricas

## Nombre del proyecto

Cuando decidan si el proyecto se llama ConectaTEC, IntegraTEC u otro nombre,
solo cambien el valor de `APP_NAME` en `src/config.js` — se usa automáticamente
en la barra de navegación.

## Próximos pasos

- Conectar los formularios de login/registro al backend en Node.js.
- Reemplazar los datos de ejemplo (arrays fijos) por llamadas a la API REST.
- Agregar el logo elegido en la barra de navegación.
