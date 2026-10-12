export const STATUSES = [
  { value: 'leido', label: 'Leído', plural: 'Leídos' },
  { value: 'leyendo', label: 'Leyendo', plural: 'Leyendo' },
  { value: 'por_leer', label: 'Por leer', plural: 'Por leer' },
  { value: 'backlog', label: 'Backlog', plural: 'Backlog' },
  { value: 'abandonado', label: 'Abandonado', plural: 'Abandonados' }
]

export const TOPICS = [
  { value: 'Producto', color: '#7dd3fc' },
  { value: 'Negocios', color: '#fcd34d' },
  { value: 'Liderazgo', color: '#fda4af' },
  { value: 'Creatividad', color: '#c4b5fd' },
  { value: 'Hábitos', color: '#86efac' },
  { value: 'Pensamiento', color: '#fdba74' },
  { value: 'Biografía', color: '#e7e5e4' },
  { value: 'Marketing', color: '#f9a8d4' },
  { value: 'Metodologías', color: '#5eead4' }
]

const FALLBACK_COLOR = '#d6d3d1'

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export const PODIUM_LABELS = { 1: '1°', 2: '2°', 3: '3°', 4: '4°', 5: '5°' }

export const MIN_PODIUM_RATING = 4

export const MEDAL_COLORS = { 1: '#c9a227', 2: '#a3a8ae', 3: '#b0743a', 4: '#57534e', 5: '#57534e' }

export function formatRating(rating) {
  return rating ? String(Number(rating)).replace('.', ',') : ''
}

export function yearOf(date) {
  return date ? date.slice(0, 4) : null
}

const SNIPPET_RADIUS = 60

export function normalize(text) {
  return (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function snippet(text, index, length) {
  const start = Math.max(0, index - SNIPPET_RADIUS)
  const end = Math.min(text.length, index + length + SNIPPET_RADIUS)
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`
}

export function searchLibrary(books, query) {
  const q = normalize(query.trim())
  if (!q) return []
  const results = []
  for (const book of books) {
    const fields = [
      { label: null, texts: [`${book.title} ${book.author || ''}`] },
      { label: 'Opinión', texts: [book.opinion || ''] },
      { label: 'Keywords', texts: book.keywords || [] },
      { label: 'Resumen', texts: [book.summary || ''] },
      { label: 'Aprendizajes', texts: book.takeaways || [] }
    ]
    let match = null
    for (const field of fields) {
      for (const text of field.texts) {
        const index = normalize(text).indexOf(q)
        if (index === -1) continue
        match = { field: field.label, text: field.label ? snippet(text, index, q.length) : null }
        break
      }
      if (match) break
    }
    if (match) results.push({ book, ...match })
  }
  return results
}

export function statusLabel(value) {
  return STATUSES.find(s => s.value === value)?.label || value
}

export function topicColor(topic) {
  return TOPICS.find(t => t.value === topic)?.color || FALLBACK_COLOR
}

export function formatMonth(date) {
  if (!date) return ''
  const [y, m] = date.split('-')
  return `${MONTHS[Number(m) - 1]} ${y}`
}

export function formatNumber(n) {
  return new Intl.NumberFormat('es-AR').format(n || 0)
}

const COVER_NOISE = /summary|insights|conversation starters|workbook|study guide/i

async function searchAppleCover(title, firstAuthor) {
  const term = [title, firstAuthor].filter(Boolean).join(' ')
  const data = await $fetch('https://itunes.apple.com/search', {
    query: { term, entity: 'ebook', limit: 10, country: 'us' },
    parseResponse: JSON.parse
  })
  const surname = firstAuthor?.split(' ').pop().toLowerCase()
  const hit = data.results.find(r =>
    !COVER_NOISE.test(r.trackName)
    && (!surname || r.artistName.toLowerCase().includes(surname))
  )
  return hit ? hit.artworkUrl100.replace('100x100bb', '1000x1000bb') : null
}

export async function searchBooks(term) {
  const data = await $fetch('https://itunes.apple.com/search', {
    query: { term, entity: 'ebook', limit: 12, country: 'us' },
    parseResponse: JSON.parse
  })
  const seen = new Set()
  return data.results
    .filter(r => !COVER_NOISE.test(r.trackName))
    .map(r => ({
      id: r.trackId,
      title: r.trackName.split(/: | \(/)[0].trim(),
      author: r.artistName.replace(/ & /g, ' y '),
      cover: r.artworkUrl100.replace('100x100bb', '1000x1000bb'),
      thumb: r.artworkUrl100,
      year: Number(r.releaseDate?.slice(0, 4)) || null
    }))
    .filter((r) => {
      const key = `${r.title}|${r.author}`.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 6)
}

export async function lookupBookFacts(title, author) {
  const query = { title, limit: 5, fields: 'first_publish_year,number_of_pages_median,edition_count' }
  if (author) query.author = author.split(/,| y /)[0].trim()
  const { docs } = await $fetch('https://openlibrary.org/search.json', { query })
  const best = [...docs].sort((a, b) => (b.edition_count || 0) - (a.edition_count || 0))[0]
  return { year: best?.first_publish_year || null, pages: best?.number_of_pages_median || null }
}

export async function searchCover(title, author) {
  const firstAuthor = author?.split(/,| y /)[0].trim()
  const apple = await searchAppleCover(title, firstAuthor).catch(() => null)
  if (apple) return apple

  const query = { title, limit: 10, fields: 'cover_i,edition_count' }
  if (firstAuthor) query.author = firstAuthor
  const { docs } = await $fetch('https://openlibrary.org/search.json', { query })
  const best = docs
    .filter(d => d.cover_i)
    .sort((a, b) => (b.edition_count || 0) - (a.edition_count || 0))[0]
  return best ? `https://covers.openlibrary.org/b/id/${best.cover_i}-L.jpg` : null
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function inline(text) {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

export function renderNotes(md) {
  if (!md) return ''
  const lines = md.replace(/\r/g, '').split('\n')
  if (lines[0]?.startsWith('# ')) lines.shift()

  const out = []
  let depth = 0
  let paragraph = []
  let images = []

  const flushImages = () => {
    if (!images.length) return
    const figures = images.map(([src, alt]) => `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async"></figure>`).join('')
    out.push(images.length > 1 ? `<div class="notes-gallery">${figures}</div>` : figures)
    images = []
  }
  const flushParagraph = () => {
    if (paragraph.length) out.push(`<p>${paragraph.map(inline).join('<br>')}</p>`)
    paragraph = []
  }
  const closeLists = (to = 0) => {
    while (depth > to) {
      out.push('</li></ul>')
      depth--
    }
  }

  for (const raw of lines) {
    const bullet = raw.match(/^(\s*)[-*] (.*)$/)
    if (bullet) {
      flushParagraph()
      flushImages()
      const level = Math.min(Math.floor(bullet[1].length / 2), 2) + 1
      if (level > depth) {
        while (depth < level) {
          out.push('<ul><li>')
          depth++
        }
      } else {
        closeLists(level)
        out.push('</li><li>')
      }
      out.push(inline(bullet[2]))
      continue
    }

    closeLists()
    const line = raw.trim()
    if (!line) {
      flushParagraph()
      continue
    }
    const image = line.match(/^!\[([^\]]*)\]\((https:\/\/[^)\s]+)\)$/)
    if (image) {
      flushParagraph()
      images.push([image[2], image[1]])
      continue
    }
    flushImages()
    const heading = line.match(/^(#{1,4}) (.*)$/)
    if (heading) {
      flushParagraph()
      const tag = heading[1].length <= 2 ? 'h3' : 'h4'
      out.push(`<${tag}>${inline(heading[2])}</${tag}>`)
      continue
    }
    paragraph.push(line)
  }
  flushParagraph()
  flushImages()
  closeLists()
  return out.join('').replace(/<li><\/li>/g, '')
}
