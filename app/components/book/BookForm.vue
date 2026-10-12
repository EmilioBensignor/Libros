<template>
  <UModal
    v-model:open="open"
    :title="editing ? 'Editar libro' : 'Agregar libro'"
    :ui="{ content: 'max-w-5xl', body: 'p-5 sm:p-8' }"
  >
    <template #body>
      <form id="book-form" class="grid grid-cols-1 md:grid-cols-[13rem_minmax(0,1fr)] gap-6 md:gap-10" novalidate @submit.prevent="submit">
        <aside class="flex md:flex-col gap-4 md:sticky md:top-0 md:self-start">
          <div class="w-28 md:w-full shrink-0">
            <BookCover :book="preview" />
          </div>
          <div class="flex-1 flex flex-col gap-2">
            <UButton
              icon="i-ph-magnifying-glass"
              label="Buscar portada"
              color="neutral"
              variant="subtle"
              block
              :loading="searchingCover"
              :disabled="!form.title?.trim()"
              @click="findCover"
            />
            <UInput v-model="form.cover_url" type="url" size="sm" placeholder="o pegá la URL" class="w-full" aria-label="URL de la portada" />
          </div>
        </aside>

        <div class="min-w-0 flex flex-col gap-6">
          <UiErrorNote :message="formError" />

          <div v-if="!editing" class="relative">
            <UInput
              v-model="query"
              icon="i-ph-magnifying-glass"
              placeholder="Buscá el libro y completo el resto"
              size="xl"
              class="w-full"
              :loading="searching"
              autofocus
              aria-label="Buscar libro"
              @keydown.enter.prevent="results[0] && pick(results[0])"
            />
            <ul
              v-if="results.length"
              class="flex flex-col absolute top-full left-0 right-0 z-10 bg-bg border border-line rounded-panel shadow-[0_16px_40px_-16px_rgba(12,10,9,0.35)] overflow-hidden mt-1.5 p-1"
            >
              <li v-for="r in results" :key="r.id">
                <button
                  type="button"
                  class="w-full flex items-center gap-3 hover:bg-surface rounded-card text-left transition-colors duration-150 p-2"
                  @click="pick(r)"
                >
                  <img :src="r.thumb" alt="" class="w-8 h-12 shrink-0 object-cover rounded-[2px]">
                  <span class="min-w-0 flex flex-col">
                    <span class="t-strong truncate">{{ r.title }}</span>
                    <span class="t-meta truncate">{{ r.author }}</span>
                  </span>
                </button>
              </li>
            </ul>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Título" required>
              <UInput v-model="form.title" size="lg" class="w-full" />
            </UFormField>
            <UFormField label="Autor">
              <UInput v-model="form.author" size="lg" class="w-full" />
            </UFormField>
          </div>

          <UFormField label="Estado">
            <div class="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Estado">
              <button
                v-for="s in STATUSES"
                :key="s.value"
                type="button"
                role="radio"
                class="border rounded-card t-strong transition-colors duration-150 active:scale-[0.97] px-3.5 py-1.5"
                :class="form.status === s.value ? 'bg-ink border-ink text-bg' : 'border-line hover:border-line-strong'"
                :aria-checked="form.status === s.value"
                @click="form.status = s.value"
              >
                {{ s.label }}
              </button>
            </div>
          </UFormField>

          <div v-if="showFinished" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Fecha">
              <UInput v-model="form.finished_at" type="date" size="lg" class="w-full" />
            </UFormField>
            <UFormField label="Puntaje">
              <BookRatingInput v-model="form.rating" />
            </UFormField>
          </div>

          <UFormField v-if="podiumEligible" label="Podio">
            <div class="flex flex-col gap-2 sm:max-w-sm">
              <BookPodiumPicker v-model="form.podium" :label="formYear" :holders="yearHolders" />
              <BookPodiumPicker v-model="form.podium_all" label="General" :places="[1, 2, 3, 4, 5]" :holders="allHolders" />
            </div>
          </UFormField>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <UFormField label="Tema" class="col-span-2 sm:col-span-1">
              <USelect v-model="form.topic" :items="topicItems" size="lg" class="w-full" placeholder="Elegí uno" />
            </UFormField>
            <UFormField label="Páginas">
              <UInput v-model.number="form.pages" type="number" min="1" size="lg" class="w-full" />
            </UFormField>
            <UFormField label="Año">
              <UInput v-model.number="form.published_year" type="number" size="lg" class="w-full" />
            </UFormField>
          </div>

          <div class="flex flex-col gap-5 border-t border-line pt-6">
            <UFormField label="Opinión" hint="Una frase con lo que te dejó">
              <UInput v-model="form.opinion" size="lg" class="w-full" />
            </UFormField>
            <UFormField label="Resumen">
              <UTextarea v-model="form.summary" :rows="2" autoresize class="w-full" />
            </UFormField>
            <UFormField label="Keywords" hint="Separadas por coma">
              <UInput v-model="form.keywordsText" size="lg" class="w-full" placeholder="Liderazgo, Cultura, Equipos" />
            </UFormField>
            <UFormField label="Aprendizajes" hint="Uno por línea, en cantidad par">
              <UTextarea v-model="form.takeawaysText" :rows="4" autoresize class="w-full" />
            </UFormField>
            <UFormField label="Notas" hint="## título · - punto · **negrita**">
              <UTextarea v-model="form.notes" :rows="8" autoresize :maxrows="24" class="w-full" />
            </UFormField>
            <UFormField label="Doc de notas en Drive">
              <UInput v-model="form.drive_url" type="url" size="lg" class="w-full" placeholder="https://docs.google.com/..." />
            </UFormField>
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <div class="w-full flex justify-end gap-2">
        <UButton label="Cancelar" color="neutral" variant="ghost" @click="open = false" />
        <UButton
          type="submit"
          form="book-form"
          color="neutral"
          :label="editing ? 'Guardar' : 'Agregar'"
          :loading="saving"
          :disabled="!canSubmit"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup>
const SEARCH_DEBOUNCE_MS = 350

const { open, editing } = useBookForm()
const { books, save, setPodium } = useBooks()
const toast = useToast()

const form = ref(emptyForm())
const saving = ref(false)
const formError = ref('')
const searchingCover = ref(false)
const query = ref('')
const results = ref([])
const searching = ref(false)

let searchTimer = null
let searchToken = 0

const topicItems = TOPICS.map(t => ({ label: t.value, value: t.value }))

const canSubmit = computed(() => !saving.value && form.value.title?.trim())
const showFinished = computed(() => ['leido', 'abandonado'].includes(form.value.status))
const formYear = computed(() => yearOf(form.value.finished_at))
const podiumEligible = computed(() =>
  form.value.status === 'leido' && Number(form.value.rating) >= MIN_PODIUM_RATING && !!form.value.finished_at)

function holdersFor(field, sameScope) {
  const holders = {}
  for (const b of books.value) {
    if (b[field] && b.id !== editing.value?.id && sameScope(b)) holders[b[field]] = b.title
  }
  return holders
}

const yearHolders = computed(() => holdersFor('podium', b => yearOf(b.finished_at) === formYear.value))
const allHolders = computed(() => holdersFor('podium_all', () => true))

const preview = computed(() => ({
  title: form.value.title || 'Título',
  author: form.value.author,
  topic: form.value.topic,
  cover_url: form.value.cover_url
}))

watch(open, (isOpen) => {
  if (!isOpen) return
  formError.value = ''
  query.value = ''
  results.value = []
  form.value = editing.value
    ? {
        ...emptyForm(),
        ...editing.value,
        takeawaysText: (editing.value.takeaways || []).join('\n'),
        keywordsText: (editing.value.keywords || []).join(', ')
      }
    : emptyForm()
})

watch(query, (term) => {
  clearTimeout(searchTimer)
  const token = ++searchToken
  if (term.trim().length < 3) {
    results.value = []
    searching.value = false
    return
  }
  searching.value = true
  searchTimer = setTimeout(async () => {
    const found = await searchBooks(term.trim()).catch(() => [])
    if (token !== searchToken) return
    results.value = found
    searching.value = false
  }, SEARCH_DEBOUNCE_MS)
})

function emptyForm() {
  return {
    title: '',
    author: '',
    topic: undefined,
    status: 'por_leer',
    rating: null,
    finished_at: '',
    pages: null,
    published_year: null,
    summary: '',
    takeawaysText: '',
    keywordsText: '',
    opinion: '',
    podium: null,
    podium_all: null,
    notes: '',
    drive_url: '',
    cover_url: ''
  }
}

function blankToNull(value) {
  if (typeof value === 'string') return value.trim() || null
  return value === '' || value === undefined ? null : value
}

async function pick(result) {
  searchToken++
  query.value = ''
  results.value = []
  Object.assign(form.value, {
    title: result.title,
    author: result.author,
    cover_url: result.cover,
    published_year: result.year
  })
  const facts = await lookupBookFacts(result.title, result.author).catch(() => null)
  if (facts?.year) form.value.published_year = facts.year
  if (facts?.pages && !form.value.pages) form.value.pages = facts.pages
}

function payload() {
  const f = form.value
  return {
    ...(editing.value ? { id: editing.value.id } : {}),
    title: f.title.trim(),
    author: blankToNull(f.author),
    topic: blankToNull(f.topic),
    status: f.status,
    rating: showFinished.value ? f.rating || null : null,
    finished_at: showFinished.value ? blankToNull(f.finished_at) : null,
    pages: f.pages || null,
    published_year: f.published_year || null,
    summary: blankToNull(f.summary),
    takeaways: f.takeawaysText.split('\n').map(t => t.trim()).filter(Boolean),
    keywords: [...new Set(f.keywordsText.split(',').map(k => k.trim()).filter(Boolean))],
    opinion: blankToNull(f.opinion),
    notes: blankToNull(f.notes),
    drive_url: blankToNull(f.drive_url),
    cover_url: blankToNull(f.cover_url),
    ...(editing.value
      ? {
          podium: keepsPodium() ? editing.value.podium : null,
          podium_all: podiumEligible.value ? editing.value.podium_all : null
        }
      : {})
  }
}

function keepsPodium() {
  const f = form.value
  return f.status === 'leido' && Number(f.rating) >= MIN_PODIUM_RATING && f.finished_at && yearOf(f.finished_at) === yearOf(editing.value.finished_at)
}

async function findCover() {
  searchingCover.value = true
  formError.value = ''
  try {
    const url = await searchCover(form.value.title, form.value.author)
    if (url) form.value.cover_url = url
    else formError.value = 'No encontré portada. Pegá la URL a mano.'
  } catch {
    formError.value = 'No se pudo buscar la portada. Probá de nuevo.'
  } finally {
    searchingCover.value = false
  }
}

async function submit() {
  if (!canSubmit.value) return
  saving.value = true
  formError.value = ''
  try {
    if (!editing.value && !form.value.cover_url) {
      form.value.cover_url = await searchCover(form.value.title, form.value.author).catch(() => null) || ''
    }
    let saved = await save(payload())
    for (const field of ['podium', 'podium_all']) {
      const wanted = podiumEligible.value ? form.value[field] || null : null
      if (wanted !== (saved[field] || null)) saved = await setPodium(saved, wanted, field)
    }
    open.value = false
    toast.add({ title: editing.value ? 'Libro guardado' : 'Libro agregado', icon: 'i-ph-check' })
    if (!editing.value) await navigateTo(`/libros/${saved.id}`)
  } catch (err) {
    formError.value = err.message || 'No se pudo guardar. Probá de nuevo.'
  } finally {
    saving.value = false
  }
}

onBeforeUnmount(() => clearTimeout(searchTimer))
</script>
