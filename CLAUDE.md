# CLAUDE.md — Libros

App personal de lectura de Lio: lo que leyó (con resumen, ideas clave y notas), lo que está leyendo
y la cola de lo que sigue. Un solo usuario, login con la misma cuenta de Registro.

> **Cómo está organizado este archivo (3 zonas):**
> - **ZONA 1 · REGLAS VIGENTES**: normas que SIEMPRE aplican (stack, patrones, código). Seguir al pie.
> - **ZONA 2 · ESTADO ACTUAL**: cómo está construido hoy cada sistema y de dónde salen los datos.
> - **ZONA 3 · HISTORIAL (no vigente)**: la app vieja y lo descartado. Solo contexto; NO recomendar
>   nada de acá como si fuera vigente. Verificar contra el código antes de usar.
>
> El detalle con fecha (qué se hizo y por qué) vive en `docs/bitacora.md`. El schema y la carga de
> datos, en `docs/datos.md`.

# ━━━━━━ ZONA 1 · REGLAS VIGENTES ━━━━━━

## Stack

| Tecnología | Versión | Uso |
|---|---|---|
| Nuxt | 4.6 | Framework, SSR |
| Nuxt UI | 4.11 | Componentes + Tailwind v4 (vía `@nuxt/ui`) |
| Tailwind | 4.3 | CSS-first, tokens en `@theme` de `main.css` |
| @nuxtjs/supabase | 2.0 | Auth (email + contraseña), redirect global, cliente |
| Íconos | Phosphor | `@iconify-json/ph`, prefijo `i-ph-` |
| Fuentes | Google Fonts | Geist (UI) + Instrument Serif (títulos y portadas) |
| Deploy | Vercel | Pendiente de crear el proyecto |

Sin Pinia, sin dayjs, sin librería de Markdown: las notas se renderizan con `renderNotes()` de
`utils/books.js`, que cubre lo que usan los apuntes (`#`, `##`, `###`, bullets con anidado,
`**negrita**` e imágenes `![](https://...)` en línea propia; solo acepta `https`). Escapa el HTML
antes de armar los tags, por eso el `v-html` de la ficha es seguro.

## Comandos

```
pnpm start     # git pull + install + dev --open (workflow diario)
pnpm dev       # nuxt dev
pnpm build     # producción
pnpm preview   # preview del build
```

Package manager: **pnpm 11**. Los builds de deps se declaran en `pnpm-workspace.yaml` con
`allowBuilds` (formato de pnpm 11; `onlyBuiltDependencies` ya no lo lee y el install falla).

## Estructura

```
app/
  app.vue                    # UApp + layout
  app.config.ts              # primary = accent (ámbar), neutral = stone
  assets/css/main.css        # tokens @theme, utilities t-*, .prose-notes, skeleton
  layouts/default.vue        # header sticky (wordmark + tabs + búsqueda + Agregar + salir) + BookForm
  middleware/session.global.js  # sin sesión → /login (mismo patrón que Registro)
  pages/
    index.vue                # biblioteca: stats + tabs de estado + búsqueda + tema + grilla
    libros/[id]/index.vue    # ficha: portada, puntaje, podios, datos, resumen, ideas clave
    libros/[id]/notas.vue    # lectura de las notas
    podios.vue               # podio general + top 3 por año
    estante.vue              # los leídos como lomos en un estante, por año o todos
    login.vue / confirm.vue  # copiados de Registro
  components/
    book/BookCover.vue       # portada tipográfica generada (color por tema)
    book/BookCard.vue        # portada + línea de contexto, link a la ficha
    book/BookForm.vue        # modal alta/edición, montado una sola vez en el layout
    book/RatingInput.vue     # 5 estrellas (BookRatingInput)
    book/StatusTabs.vue      # tabs de estado del header (BookStatusTabs)
    book/PodiumPicker.vue    # 1°/2°/3° con color de medalla (BookPodiumPicker)
    book/PodiumSlot.vue      # un puesto de /podios, con hueco si está libre (BookPodiumSlot)
    book/SearchResults.vue   # resultados del buscador global (BookSearchResults)
    book/ShelfBook.vue       # un lomo del estante (BookShelfBook)
    book/ViewToggle.vue      # toggle Portadas | Estante del header (BookViewToggle)
    ui/ErrorNote.vue, ui/EmptyState.vue
  composables/
    useBooks.js              # CRUD contra public.books
    useBookForm.js           # abre el modal desde cualquier lado
  utils/books.js             # STATUSES, TOPICS, medallas, formatters, renderNotes, searchLibrary
  plugins/pwa.client.js      # registra /sw.js
public/
  manifest.webmanifest, sw.js, icon-180/192/512.png, favicon.ico
scripts/
  generate-icon.py           # genera los íconos (python3 scripts/generate-icon.py public)
```

## Convenciones

- UI en español rioplatense, código en inglés. **Cero comentarios** en JS/Vue: lo que necesita
  explicación va acá.
- `.vue`: `<template>` → `<script setup>` → `<style scoped>`. Nunca `lang="ts"`.
- Componentes por feature (`book/`, `ui/`). La carpeta es `book/` (singular) a propósito: Nuxt
  saca el prefijo repetido y quedan `BookCover`, `BookCard`, `BookForm`. Con `books/` serían
  `BooksBookCover`.
- **`BookCover` no se dimensiona con clases desde afuera**: su raíz tiene `w-full` y un `w-16`
  pasado por prop compite con él (gana el que Tailwind emite después; pasó en notas y en el modal,
  donde la portada salía gigante). Siempre envolverla en un `div` con el ancho.
- Estado compartido con `useState` y key namespaced: `books:all` (la lista), `books:current`
  (la ficha abierta), `book-form:open` y `book-form:book`.
- `save()` de `useBooks` actualiza la lista y la ficha abierta, así editar desde el modal refresca
  la ficha sin volver a pedirla.

## Sistema de diseño

**Tema claro, único, sin toggle** (pedido de Lio, 2026-10-11: la primera versión era dark como
Registro y no le gustó). Fondo blanco puro (`#ffffff`, nunca crema ni off-white), superficies
`surface` / `surface-2` en stone, líneas `line-subtle` / `line` / `line-strong`.

Se mantiene la regla de Registro de **un solo color de tinta** (`--color-ink`, `#0c0a09`): la
jerarquía de texto sale de tamaño, peso, familia (serif vs sans) y posición, nunca de grises ni
`opacity-*`.

- Acento ámbar (`accent-700`) solo en hover de links y focus. Las estrellas van en `gold`.
- Medallas: `gold` `#c9a227`, `silver` `#a3a8ae`, `bronze` `#b0743a`. Es el único color fuera de
  las portadas.
- Nuxt UI corre con `ui.colorMode: false` en `nuxt.config`: sin eso, una preferencia dark guardada
  en el navegador pintaba los inputs de negro sobre el fondo blanco.
- **La foto de portada es la protagonista** y **todas tienen el mismo alto** (pedido de Lio): `aspect-2/3`
  con `object-cover`; si una tapa es más angosta se recorta un poco, y está bien. `BookCover` muestra `cover_url`; si es null o la
  imagen falla (`@error`), cae a la portada tipográfica: color fijo por tema (`TOPICS` en
  `utils/books.js`, tonos 300 de Tailwind) con tinta oscura (`--color-cover-ink`) encima.
- Instrument Serif para wordmark, títulos de libro, años y el resumen. Geist para el resto.
- `html { scrollbar-gutter: stable }`: sin eso, pasar de una página con scroll a una sin scroll
  corre todo unos píxeles en desktop.
- Utilities `t-label`, `t-meta`, `t-body`, `t-strong`, `t-figure` (mismos nombres que Registro).

## Brief de diseño

- Referencia: una biblioteca física vista de frente; sistema de tokens de Registro.
- Registro: app.
- Tres adjetivos: sobria, editorial, tranquila.
- Gesto fuerte: la grilla de portadas reales agrupada por año.
- Tipografía: Instrument Serif (display) / Geist (UI).
- Paleta: blanco y tinta casi negra; el color lo ponen las portadas.
- Prohibido: dark mode, grises para jerarquía, itálicas de acento, labels mono, botones pill, fondo crema.

# ━━━━━━ ZONA 2 · ESTADO ACTUAL ━━━━━━

## Base de datos

Vive en el proyecto de Supabase **Registro** (server MCP `supabase-registro`), en la tabla
`public.books`. No hay otra tabla. Las imágenes de las notas viven en el bucket público
`book-images` del mismo proyecto (solo escribe la service role). El `.env` apunta a ese proyecto (`SUPABASE_URL` +
`SUPABASE_KEY` publishable, las mismas que Registro). Schema, RLS y cómo se cargaron los datos:
`docs/datos.md`.

La migración se aplicó por MCP y su archivo vive en el repo de Registro
(`supabase/migrations/20261012022515_libros.sql`), porque esa es la convención de ese proyecto:
una migración aplicada = un archivo en su carpeta. Cambios de schema futuros van ahí también.

## Pantallas

**Header (layout)**: una sola barra sticky de `h-15`. Desktop: wordmark, tabs de estado
(`BookStatusTabs`, solo en `/`), buscador global, Podios, Agregar y salir (con confirmación en
`UModal`). **Mobile** (`md:hidden`): el header queda con wordmark y salir, y en `/` los tabs en una
segunda fila con scroll horizontal. La navegación pasa a una **barra inferior fija** con
Biblioteca · Buscar · Agregar · Podios (botones; el activo con ícono `-fill` y semibold, nunca con
opacidad), con `safe-area-inset-bottom`. Buscar abre el campo arriba y le da foco. El `main` deja
6rem abajo en mobile para que la barra no tape contenido.

**Estante (`/estante`)**: los libros del estado elegido en los tabs (Leídos por defecto) como lomos
parados en **un solo estante** (Lio sacó el "Por año"). Sin título propio, igual que Portadas: las
dos vistas comparten header y tabs, así el toggle no mueve nada (antes los tabs solo estaban en `/`
y el salto se notaba, sobre todo en mobile, donde desaparecía la segunda fila del header). Todos los actuales tienen que entrar en una fila en desktop; si en el
futuro no entran, `rows` los reparte en varios estantes según el ancho medido con
`ResizeObserver`, cada uno con su tablón (`#3b2f26`). **Proporciones reales** (pedido de Lio): alto y grosor
usan la misma escala, 18 px/cm en desktop y 12 en mobile. Alto = `height_cm`; grosor = `páginas ×
0,0065 cm` + tapas (0,5 cm si mide 23,5 cm o más, que se toma como tapa dura; 0,2 cm si no). Con
los 18 actuales: lomos de 20 a 80px, unos 806px en total. Fondo = `spine_color` (o el del tema si
falta), sin nada encima del título. **Contraste**: el título va en negro o blanco según cuál tenga más contraste WCAG con el
color del lomo (luminancia relativa), vertical, centrado y en dos líneas si el lomo da. Punto de medalla si está en el podio del año. Hover o foco:
el libro sale del estante (sin cartel: los títulos ya se leen en el lomo); click → ficha. **Orden en ola** (pedido de Lio: ni del más alto al más bajo ni por fecha):
se ordenan por alto y se reparten round-robin en olas de unos 6 libros (`BOOKS_PER_WAVE`); dentro
de cada ola se acomodan en "tubo de órgano" (bajos en las puntas, altos al medio), así el estante
sube y baja parejo. **Lomo**: serif (Instrument Serif) de 12 a 22px según el ancho, centrado;
brillo a la izquierda y sombra a la derecha para el volumen; dos bandas finas arriba y abajo en el
color de la tinta al 50%, que no tocan el título. **Portadas y
Estante son dos vistas de la misma biblioteca**: `BookViewToggle` (header, en `/` y `/estante`;
solo íconos debajo de `lg:`) pasa de una a otra. En la barra inferior hay un solo ítem
"Biblioteca", activo en las dos.

**Buscador global**: `useState('books:search')`. Busca en todos los estados por título, autor,
keywords, resumen y aprendizajes (`searchLibrary()`, sin acentos ni mayúsculas) y en `/` reemplaza
la grilla por la lista de resultados, con la portada, el estado y un fragmento del campo donde
encontró la coincidencia. Escribir desde otra página navega a `/`. Las keywords de la ficha son
botones que buscan esa keyword. Por eso la lista trae `summary`, `takeaways` y `keywords`.

**Biblioteca (`/`)**: solo la grilla, sin título ni stats (Lio pidió menos datos; se sacaron
también los contadores de los tabs y el filtro por tema). El estado va en `?estado=` (Leídos es
el default y no lleva query). Abandonados aparece solo si hay alguno. Leídos se agrupa por año
de `finished_at` ("Sin fecha" al final), con la cantidad de libros al lado de cada año, y adentro
de cada año van primero los del podio (1°, 2°, 3°) y después el resto por fecha. Por leer y Backlog se ordenan por `sort_order`; en Por
leer cada card dice "Siguiente N". La card es la portada + una línea (fecha y estrellas, o
posición en la cola). Los libros del podio llevan un círculo negro con el puesto sobre la portada.

Estados: `leido`, `leyendo`, `por_leer` (comprado, en cola), `backlog` (recomendado, sin decidir
si se lee) y `abandonado`.

Ancho: `max-w-400` (1600px) con `xl:px-14`; la grilla llega a 8 columnas desde `xl:` (1280px).

**Ficha (`/libros/[id]`, archivo `pages/libros/[id]/index.vue`)**: pensada para repasar libro por
libro. Barra de arriba: volver a la lista del estado a la izquierda; a la derecha el paso siguiente
(si aplica), Notas (lleva a la página de notas), Editar, borrar y, separadas por una línea, las
flechas anterior/siguiente con "N de M" (libros del mismo estado, en el orden de la lista). No hay
botón de Drive en la ficha (Lio lo sacó; queda en la página de notas). La columna izquierda **no
puede tener scroll**: portada (`15rem`/`18rem`, sticky en `top-22`) y, si está leído, Puntaje y
Podio (dos filas de `BookPodiumPicker`: el año y General). A la derecha, desde `xl:`: arriba una
fila con título + autor a la izquierda y los datos con etiqueta a la derecha (Estado si no está
leído, Leído, Tema, Páginas, Publicado); abajo "Resumen" (con las keywords debajo) | "Aprendizajes" lado a lado. Los nombres
"Resumen" y "Aprendizajes" los pidió Lio (antes "De qué trata" e "Ideas clave"); en la base siguen
siendo `summary` y `takeaways`. En mobile las acciones de la barra se agrupan en un
`UDropdownMenu` (⋯) y quedan visibles solo volver y las flechas.

**Un solo ancho para toda la app** (pedido de Lio): header, biblioteca, ficha y notas usan el
contenedor del layout (`max-w-400`, mismo padding), así los bordes no saltan entre páginas. Ninguna
página agrega su propio `max-w` + `mx-auto`. El ancho se aprovecha adentro: la ficha parte el
contenido en dos columnas desde `xl:` (resumen + tarjeta de notas | ideas clave), y en notas el
texto se limita a 75ch alineado a la izquierda mientras galerías e imágenes usan todo el ancho.

**Notas (`/libros/[id]/notas`)**: página de lectura aparte, **una sola columna** (Lio sacó la
columna lateral). Header compacto en una línea: volver, título + "Mis notas · autor",
Drive. Texto a 17px (`.prose-reading`). Para que ocupe menos alto: cada imagen tiene `max-height`
de 26rem, y las imágenes consecutivas (aunque las separe una línea en blanco) se agrupan en una
grilla `.notes-gallery` de columnas de 14rem, con alto máximo de 16rem y `object-fit: contain`.

**Puntaje**: `numeric(2,1)` de 0,5 a 5 en medios puntos. `BookRatingInput` divide cada estrella en
dos zonas clickeables (mitad izquierda = ,5), muestra el número al lado y la media estrella es la
llena recortada con `clip-path` sobre la vacía (el ícono `star-half-fill` de Phosphor no dibuja el
contorno de la otra mitad). Tocar el valor actual lo borra.

**Podios**: anual (`podium`, por año de `finished_at`) y general (`podium_all`, de todos los
tiempos). Un puesto por alcance, garantizado con índices únicos parciales. `setPodium(book, place,
field)` libera el puesto si lo tenía otro libro y después lo asigna. Colores de medalla en
`MEDAL_COLORS` (`utils/books.js`) y tokens `--color-gold/silver/bronze`. En la grilla, el podio
anual se marca con un marco (`outline` con offset) del color de la medalla y un círculo con el
puesto. **`/podios`**: el general arriba en forma de podio (2° · 1° · 3°, el 1° más alto) y debajo
el top 3 de cada año, con huecos punteados "Sin elegir". Link "Podios" en el header.

**Alta y edición**: `BookForm` en un `UModal` de `max-w-5xl`, en dos columnas: a la izquierda la
portada en vivo (`BookCover` con los datos del form) con "Buscar portada" y la URL; a la derecha
los campos. Al crear, arriba hay un buscador: tipeás 3 letras, consulta Apple Books
(`searchBooks()`, debounce de 350ms) y al elegir un resultado completa título, autor y portada; año
original y páginas los completa después Open Library (`lookupBookFacts()`). Enter elige el primero.
Estado en botones, no en select. **Una sola fecha por libro** (pedido de Lio): "Fecha" =
`finished_at`, junto al puntaje, solo para leído y abandonado. `started_at` sigue en la base (Lio
no quiso borrar la columna) pero la app no la muestra ni la escribe; ojo con el check
`finished_at >= started_at`, que sigue vigente para los 17 libros que la tienen cargada. El estado por defecto de un libro nuevo es Por leer. Ideas clave se cargan una por línea y
se guardan como `text[]`. Si se guarda sin portada, la busca sola. Al crear, navega a la ficha.

## PWA

Igual que Registro: `manifest.webmanifest` (standalone, portrait, blanco), `sw.js` (cachea el shell,
navegación network-first con fallback a `/`, imágenes y fuentes cache-first) y
`plugins/pwa.client.js` que lo registra. Al cambiar `sw.js`, subir la versión de `CACHE`.

Ícono: libro blanco con lomo y el isotipo de Motix en negro sobre la tapa, encima de un humo
difuminado con los colores del `SmokeBackground` de la web de Motix (violeta `#820aff`, celeste
`#00f7e6`, lima `#c9f21c`). Todo dentro del 64% central para que sirva como maskable. Se genera
con `python3 scripts/generate-icon.py public` (PIL; toma el isotipo de
`~/Desktop/Motix/Logo/Isotipo.jpg`).

## Pendiente

- Puntajes: los 17 leídos se cargaron sin `rating` (las notas no lo tenían).
- Deploy en Vercel con las dos env vars de Supabase.
- `Product Psychology.pdf` (carpeta Libros de Drive) no se cargó: no queda claro si es un libro
  leído o material de consulta.

# ━━━━━━ ZONA 3 · HISTORIAL (no vigente) ━━━━━━

## La app vieja (hasta 2026-10-11)

Arrancó del template `PCM-Template`: Nuxt 4 + `@nuxtjs/tailwindcss` (Tailwind v3) + npm, con una
librería propia de campos de formulario (`components/form/*`), tablas genéricas, papelera
(`deleted_at`) y registro de usuarios abierto. Usaba un proyecto de Supabase propio con tres
tablas (`books`, `book_assets` para imágenes en Storage, `book_links`) y campos como
`notas_rich` (JSON de editor), `color_representativo` y `keywords`.

Ese proyecto de Supabase se borró: el host ya no resolvía DNS. Los datos se recuperaron de la
fuente original, los docs de la carpeta "Libros" de Drive (ver `docs/datos.md`). Todo el código
viejo está en git, en los commits anteriores a la reescritura.

Descartado a propósito al reescribir: papelera (el borrado pide confirmación y listo), imágenes y
links por libro (la portada es generada y el único link es el doc de Drive), registro de usuarios
y la librería de forms propia (reemplazada por Nuxt UI).
