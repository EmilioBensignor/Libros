# Bitácora: cambios grandes, con fecha

Historia del proyecto. No es contexto de arranque; se lee si el tema vuelve.

## Reescritura y migración a Registro (2026-10-11)

**Punto de partida.** El repo tenía la app armada sobre `PCM-Template` (Tailwind v3 vía
`@nuxtjs/tailwindcss`, npm, `tailwind.config.js`) y apuntaba a un proyecto de Supabase que ya no
existe: el host del `.env` no resolvía DNS. Los datos de esa base se perdieron con el proyecto.

**Base.** Lio pidió una sola tabla de libros dentro del proyecto Registro, en vez de un proyecto
nuevo. Se creó `public.books` por MCP (migración `20261012022515_libros`, archivo guardado en el
repo de Registro). Se sacaron `book_assets` y `book_links` de la app vieja: las imágenes y links
por libro no se usaban. Estado con `text` + check en vez de un enum de Postgres, igual que la tabla
`notas` de Registro.

**Datos.** La fuente real era la carpeta "Libros" de Drive: 17 docs de notas, uno por libro, y un
doc "Recomendaciones" con la lista de lo que sigue. Se cargaron 17 leídos y 16 por leer. Criterio
de cada campo en `docs/datos.md`.

**App.** Se borró todo `app/` y se rehízo con el stack actual de Lio para apps: Nuxt UI v4,
Tailwind v4 CSS-first, pnpm. El sistema de diseño y el login se tomaron de Registro (mismo
usuario, mismo proyecto de Supabase). Lo nuevo es la portada tipográfica por tema y la
agrupación por año.

**Verificado**: `pnpm build` sin errores; los 17 bloques de notas renderizan con listas
balanceadas; todos los íconos `i-ph-*` existen en el set instalado; la API sin sesión devuelve
`[]`. No se probó la app logueada (no hay credenciales en la sesión de trabajo).

## Tema claro y fotos de portada (2026-10-11)

A Lio no le gustó la primera UI: pidió tema claro y la foto real de la portada en vez de la
portada tipográfica. Se invirtieron los tokens de `main.css` (blanco + tinta `#0c0a09`, misma
regla de un solo color de tinta) y se agregó `cover_url`, cargada para los 33 libros desde Open
Library. La portada tipográfica quedó como respaldo cuando no hay foto o la imagen no carga.

## Portadas en alta, backlog y correcciones de la lista (2026-10-12)

- Las portadas de Open Library se veían mal (escaneos de 500px, algunas con stickers). Se pasaron a
  Apple Books a 1000px, y el botón "Buscar" del modal usa la misma fuente primero.
- Los inputs se veían negros: Nuxt UI tomaba una preferencia dark guardada. Fix: `ui.colorMode: false`.
- Header y filtros rehechos: título + stats en una línea, tabs subrayados, búsqueda y tema a la
  derecha, `max-w-400` en desktop. Se sacó el tab "Todos" y el título/autor debajo de cada portada.
- Estado nuevo `backlog` para lo recomendado que no está comprado.
- Lio pasó su lista real de leídos: faltaba Continuous Discovery Habits. Leyendo: Tribe y Radical
  Candor. Próximo: The Culture Code.
- **El hueco de julio 2025 a enero 2026** en Leídos sale de las fechas aproximadas: entre el
  21/07/2025 y el 31/01/2026 no se creó ningún doc en la carpeta de Drive. Se corrige editando las
  fechas de cada libro en el modal.

## Notas completas con imágenes (2026-10-12)

Lio va a auditar cada libro contra sus docs de Drive, que tienen imágenes. Se reemplazaron las notas
recortadas por la conversión fiel de cada doc (API de Docs → Markdown) y se importaron las 93
imágenes al bucket `book-images`. `renderNotes()` suma soporte de imágenes. Exportar los docs como
archivo no servía: hay docs de hasta 16MB y el contenido pasa por el contexto del agente.

## Podio anual y repaso libro por libro (2026-10-12)

Lio quiere elegir el top 3 de cada año (los anteriores y el actual a medida que avanza) y puntuar
cada libro, repasándolos de a uno. Columna `podium` con índice único por año
(migración `20261012031635_libros_podio`), puntaje y podio editables en un clic desde la ficha,
navegación anterior/siguiente y el contador por año de vuelta en la biblioteca.

## Ficha más simple, notas aparte, medias estrellas y podio general (2026-10-12)

Primera ronda de correcciones de la ficha con Lio: la columna izquierda tenía scroll (se dejó solo
portada + repaso y los datos pasaron a una línea), las notas se mudaron a `/libros/[id]/notas`, el
puntaje admite ,5 (`rating` pasó a `numeric(2,1)`), se sumó el podio general (`podium_all`) y la
página `/podios`, y el podio se marca con marco de color medalla. Migración
`20261012032450_libros_medias_y_podio_general`. La ficha se movió a `pages/libros/[id]/index.vue`
porque con `notas.vue` al lado, `[id].vue` pasaba a ser ruta padre y necesitaba `<NuxtPage>`.

## Keywords, buscador global, navegación mobile y PWA (2026-10-12)

- "De qué trata" → "Resumen" e "Ideas clave" → "Aprendizajes" (solo en la UI).
- Columna `keywords`, cargada para los 17 libros con resumen, visible bajo el resumen.
- Buscador global en el header sobre título, autor, resumen, aprendizajes y keywords.
- Mobile: barra inferior de navegación y menú ⋯ en la ficha (la barra de acciones no entraba).
- PWA con el mismo patrón que Registro e ícono propio (libro + isotipo sobre el humo de Motix).

## Tapas clásicas, estante y toggle de vistas (2026-10-12)

- Seis tapas reemplazadas a pedido de Lio por la edición clásica (Amazon por ISBN, a 1200px, en el
  bucket); Inspired volvió a la blanca y Atomic Habits pasó a la edición en castellano de Paidós.
  Todas las portadas con el mismo alto (2:3, se recorta lo que sobra).
- Vista Estante: lomos con alto y grosor reales a la misma escala, color dominante de la tapa,
  título con el mejor contraste (negro o blanco), orden en ola por alto. Columnas `height_cm` y
  `spine_color` (migración `20261012054516_libros_estante`).
- Portadas y Estante son dos vistas con un toggle; comparten header y tabs para que no haya salto.
- `docs/auditoria.md`: todos los libros con su info en un formato fijo para que Lio la edite de una
  y se reimporte.

## Auditoría importada: opinión, menciones y puntaje mínimo (2026-10-12)

Lio devolvió `docs/auditoria.md` editado con todos los libros y reglas nuevas: opinión por libro,
menciones honoríficas 4 y 5 en el podio general, puntaje mínimo 4 para cualquier podio, keywords
con mayúscula y aprendizajes en cantidad par. Se aplicó la migración y se importó el archivo
entero. En `/podios` los años cerrados ya no muestran huecos que nunca se van a llenar.
