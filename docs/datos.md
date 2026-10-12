# Datos: schema y carga

Cómo es la tabla y de dónde salió cada dato. Se lee al tocar la base o al cargar libros en lote.

## `public.books` (proyecto Supabase Registro)

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | `gen_random_uuid()` |
| `user_id` | uuid | default `auth.uid()`, FK a `auth.users` con cascade |
| `title` | text | obligatorio, no vacío |
| `author` | text | varios autores en un solo string ("A y B") |
| `status` | text | `backlog` · `por_leer` · `leyendo` · `leido` · `abandonado` (check) |
| `topic` | text | uno de `TOPICS` en `utils/books.js`; la base no lo restringe |
| `rating` | numeric(2,1) | 0,5 a 5 en medios puntos, null = sin puntuar |
| `pages` | int | > 0 |
| `published_year` | smallint | año de la edición original |
| `started_at` / `finished_at` | date | check: fin >= inicio |
| `summary` | text | 2 o 3 oraciones, de qué trata |
| `takeaways` | text[] | ideas clave, una por ítem, default `{}` |
| `keywords` | text[] | en minúsculas; entran en el buscador global (migración `20261012051659_libros_keywords`) |
| `height_cm` | numeric(4,1) | alto físico en cm, para el estante |
| `spine_color` | text | `#rrggbb`, color dominante de la tapa, para el lomo |
| `notes` | text | apuntes en Markdown simple (ver `renderNotes`) |
| `drive_url` | text | doc de notas original |
| `cover_url` | text | foto de portada (Apple Books u Open Library); null = portada tipográfica |
| `podium` | smallint | 1 a 3, puesto en el top del año de `finished_at`; único por año, solo leídos |
| `podium_all` | smallint | 1 a 5 (4 y 5 = menciones), podio general; único por usuario, solo leídos |
| `opinion` | text | frase corta de Lio sobre el libro |
| `sort_order` | int | orden de la cola de por leer (1 = el siguiente) |
| `created_at` / `updated_at` | timestamptz | `updated_at` por trigger `set_updated_at()` |

Índice `(user_id, status)`. RLS con una sola policy `books_own` (FOR ALL, `user_id = auth.uid()`).
Grants a `authenticated` y `service_role`, nada a `anon`: sin sesión, la API devuelve `[]`.

**Por MCP, filtrar siempre por `user_id`**: `execute_sql` corre como postgres y saltea RLS. El
`user_id` de Lio es `4e9f44f7-afdb-4e58-82ca-e924a817128a`.

## Carga inicial (2026-10-11)

**Leídos (17).** Uno por doc de la carpeta "Libros" de Drive de Lio (cada doc se llama como el
libro, en mayúsculas). De cada doc salieron:

- `notes`: **conversión fiel del doc completo** (reemplazó el 2026-10-12 a una primera versión
  limpiada y recortada a 6000 caracteres). Se leyó cada doc con la API de Google Docs y se pasó a
  Markdown: headings por estilo, bullets con su anidado, negritas, e imágenes en su lugar como
  `![](url)`. Las 93 imágenes se bajaron de los links temporales de Google y se subieron al bucket
  público `book-images` de Registro, en `<book_id>/<NN>.<ext>` (migración
  `20261012030643_libros_imagenes`). Las más pesadas: User Story Mapping (39) y Sprint (30).
- `summary` y `takeaways`: **generados** por un agente a partir de las notas, no escritos por Lio;
  están para auditar. Cuando las notas eran casi vacías
  (Steve Jobs, Leaders Eat Last, The Lean Startup) se completaron con el contenido conocido del
  libro.
- `author`, `published_year`, `pages`, `topic`: datos públicos del libro, no estaban en los docs.
- `started_at`: fecha de creación del doc.
- `finished_at`: fecha de última edición del doc, salvo que esté a más de 45 días de la creación;
  en ese caso se usa la de creación. Varios docs se editaron todos juntos el 2025-04-18 y otros
  meses después de leerlos, y esa fecha no dice cuándo se terminó el libro. **Son aproximadas.**
- `drive_url`: link al doc.
- `status = leido` para todos. Legacy se creó el 2026-09-18 y podría estar en curso.

**Por leer (16, hoy 3 + 14 en backlog).** Del doc "Recomendaciones" de la misma carpeta, en el orden en que aparecen:
primero "Siguientes a leer" (7), después "Después" (7) y al final "Producto, por si sucede" (2).
Ese orden es el `sort_order`. Los precios que tenía el doc no se cargaron.

**Portadas.** Primero se cargaron de Open Library, pero eran escaneos de 500px con poca calidad.
Se reemplazaron por las de Apple Books: iTunes Search API (`entity=ebook`) por título y primer
autor, descartando resúmenes y workbooks, y pidiendo `1000x1000bb` en la URL de `mzstatic.com`
(mantiene la proporción: salen de unos 650x1000). Solo The Win Without Pitching Manifesto no está
en Apple y quedó con la de Open Library. No se revisaron a ojo; se cambian desde el modal.
Columna agregada en la migración `20261012024701_libros_portada` (archivo en Registro).

**Keywords (2026-10-12).** Generadas por el agente para los 17 libros con resumen, a partir del
resumen y los aprendizajes; están para auditar junto con el resto.

**Tapas clásicas (2026-10-12).** Lio marcó seis tapas de Apple que no le gustaban (ediciones
especiales, mucho texto, colores raros, The Mom Test con un placeholder rosa). Se reemplazaron por
la tapa de Amazon de una edición elegida a ojo por ISBN, bajada a 1200px de alto
(`images-na.ssl-images-amazon.com/images/P/<ISBN10>.01._SCRMZZZZZZ_SL1200_.jpg`) y subida al bucket
en `book-images/covers/<ISBN10>.jpg`: Inspired 0981690408 (después Lio prefirió la blanca, 1119387507), User Story Mapping 1491904909, Atomic
Habits 0735211299 (después cambiada por la edición mexicana de Paidós, ISBN 9786077476726, desde
Apple Books), The Mom Test 1492180742, Start With Why 1591842808, No Rules Rules 0753553651.

**Estante (2026-10-12, migración `20261012054516_libros_estante`).** `spine_color` = el color más
frecuente de la tapa (PIL, cuantizada a 5 colores sobre una versión de 60x90). `height_cm` = la
mediana del alto en las ediciones de Open Library que traen `physical_dimensions` (solo 9 libros);
para el resto, el formato típico de la edición (tapa dura ~24,1 cm, rústica 19,7 a 23,5 cm):
**aproximado**. Al cambiar una portada conviene recalcular `spine_color`.

**Correcciones de Lio (2026-10-12).**
- Faltaba Continuous Discovery Habits (Teresa Torres): leído, sin doc en Drive. Terminado: abril 2025 (el mes siguiente a Atomic Habits, por indicación de Lio).
- Leyendo: Tribe (Sebastian Junger, no el Tribes de Seth Godin) y Radical Candor (Kim Scott).
- Por leer, ya comprados: The Culture Code (el próximo, `sort_order` 0), The Win Without Pitching
  Manifesto y Steal Like an Artist.
- El resto de "Recomendaciones" pasó a `backlog` (migración `20261012030400_libros_backlog`).

Se insertaron por la API REST con la service role de Registro (un solo POST con el array).

## Auditoría de Lio (2026-10-12)

Lio editó `docs/auditoria.md` con todos los libros: puntajes, podios, opiniones, keywords con
mayúscula, resúmenes y aprendizajes reescritos (6 por libro). Se importó entero por la API REST,
actualizando cada fila por título (37 de 37). Con eso entraron las reglas nuevas de la migración
`20261012091018_libros_opinion_y_menciones`: columna `opinion`, `podium_all` de 1 a 5 y el check
`books_podium_min_rating` (podio solo con `rating >= 4`).

**Reimportar el archivo**: cada libro es un bloque `### Título` con líneas `- Campo: valor` (Autor,
Estado, Fecha, Tema, Puntaje con coma decimal, Podio año, Podio general, Opinión, Keywords
separadas por coma), después `**Resumen**` con un párrafo y `**Aprendizajes**` con una lista
numerada. Se parsea por bloque y se hace `PATCH /rest/v1/books?title=eq.<título>&user_id=eq.<id>`
con la service role. El título es la clave: no se cambia en el archivo. Si se reimporta con
podios nuevos, conviene vaciar antes los podios en la base para no chocar con los índices únicos
a mitad del lote.

## Cargar más en lote

Mismo camino: armar un JSON con las columnas de arriba, `user_id` incluido, y hacer POST a
`/rest/v1/books` con la service role (está en el `.env` de Registro, no en este repo). Para uno o
dos libros, usar el modal de la app.
