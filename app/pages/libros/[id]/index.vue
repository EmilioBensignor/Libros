<template>
  <div class="flex flex-col gap-8">
    <div class="flex items-center justify-between gap-4">
      <NuxtLink :to="backTo" class="flex items-center gap-1.5 t-strong hover:text-accent-700 transition-colors duration-150">
        <UIcon name="i-ph-arrow-left" class="size-4" />
        {{ backLabel }}
      </NuxtLink>

      <div class="flex items-center gap-1">
        <template v-if="book">
          <div class="hidden sm:flex items-center gap-1">
            <UButton v-if="nextStep" :icon="nextStep.icon" color="neutral" :loading="advancing" :aria-label="nextStep.label" class="mr-1" @click="advance">
              <span class="hidden sm:inline">{{ nextStep.label }}</span>
            </UButton>
            <UButton
              v-if="book.notes"
              :to="`/libros/${book.id}/notas`"
              icon="i-ph-article"
              color="neutral"
              variant="ghost"
              aria-label="Notas"
            >
              <span class="hidden sm:inline">Notas</span>
            </UButton>
            <UButton icon="i-ph-pencil-simple" color="neutral" variant="ghost" aria-label="Editar" @click="openForm(book)">
              <span class="hidden sm:inline">Editar</span>
            </UButton>
            <UButton icon="i-ph-trash" color="neutral" variant="ghost" aria-label="Borrar libro" @click="confirmOpen = true" />
          </div>
          <UDropdownMenu :items="mobileActions" :content="{ align: 'end' }" class="sm:hidden">
            <UButton icon="i-ph-dots-three" color="neutral" variant="ghost" aria-label="Acciones" />
          </UDropdownMenu>
        </template>

        <template v-if="siblings.list.length > 1">
          <span class="w-px h-6 bg-line mx-2" aria-hidden="true" />
          <span class="hidden sm:inline t-meta tabular mr-1">{{ siblings.index + 1 }} de {{ siblings.list.length }}</span>
          <UButton
            icon="i-ph-caret-left"
            color="neutral"
            variant="subtle"
            aria-label="Libro anterior"
            :to="siblings.prev ? `/libros/${siblings.prev.id}` : undefined"
            :disabled="!siblings.prev"
          />
          <UButton
            icon="i-ph-caret-right"
            color="neutral"
            variant="subtle"
            aria-label="Libro siguiente"
            :to="siblings.next ? `/libros/${siblings.next.id}` : undefined"
            :disabled="!siblings.next"
          />
        </template>
      </div>
    </div>

    <UiErrorNote :message="error" :on-retry="fetchBook" />

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[18rem_minmax(0,1fr)] gap-10">
      <div class="w-44 md:w-full aspect-2/3 skeleton" />
      <div class="flex flex-col gap-4">
        <div class="w-3/4 h-14 skeleton" />
        <div class="w-1/3 h-6 skeleton" />
        <div class="w-full h-32 skeleton mt-6" />
      </div>
    </div>

    <UiEmptyState v-else-if="!book" message="Este libro no existe o lo borraste." icon="i-ph-book-open">
      <UButton to="/" label="Volver a la biblioteca" color="neutral" variant="subtle" />
    </UiEmptyState>

    <article v-else class="grid grid-cols-1 md:grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[18rem_minmax(0,1fr)] gap-8 md:gap-12 lg:gap-20">
      <aside class="flex flex-row md:flex-col items-start gap-5 md:sticky md:top-22 md:self-start">
        <div
          class="w-36 md:w-full shrink-0 rounded-[6px]"
          :style="medal ? { outline: `3px solid ${medal}`, outlineOffset: '4px' } : null"
        >
          <BookCover :book="book" large />
        </div>

        <div v-if="book.status === 'leido'" class="w-full flex flex-col gap-5">
          <div class="flex flex-col gap-1">
            <span class="t-label">Puntaje</span>
            <BookRatingInput :model-value="book.rating" class="-ml-1" @update:model-value="rate" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="t-label">Podio</span>
            <BookPodiumPicker
              v-if="podiumYear"
              :model-value="book.podium"
              :label="podiumYear"
              :holders="yearHolders"
              :disabled="savingPodium"
              @update:model-value="place => togglePodium(place, 'podium')"
            />
            <BookPodiumPicker
              :model-value="book.podium_all"
              label="General"
              :holders="allHolders"
              :disabled="savingPodium"
              @update:model-value="place => togglePodium(place, 'podium_all')"
            />
          </div>
        </div>
      </aside>

      <div class="min-w-0 flex flex-col gap-10">
        <header class="flex flex-col xl:flex-row xl:items-end justify-between gap-6 xl:gap-12">
          <div class="min-w-0 flex flex-col gap-2">
            <h1 class="font-serif text-[44px] sm:text-[60px] lg:text-[76px] leading-[0.95] wrap-break-word">
              {{ book.title }}
            </h1>
            <p v-if="book.author" class="t-body text-[20px]">{{ book.author }}</p>
          </div>

          <dl class="flex flex-wrap shrink-0 gap-x-10 gap-y-3 xl:pb-2">
            <div v-for="fact in facts" :key="fact.label" class="flex flex-col gap-0.5">
              <dt class="t-label">{{ fact.label }}</dt>
              <dd class="t-strong tabular">{{ fact.value }}</dd>
            </div>
          </dl>
        </header>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-10 xl:gap-16 items-start">
          <section v-if="book.summary" class="flex flex-col gap-4">
            <h2 class="t-label border-b border-line-strong pb-2">Resumen</h2>
            <p class="max-w-[60ch] font-serif text-[22px] sm:text-[25px] leading-[1.32]">
              {{ book.summary }}
            </p>
            <ul v-if="book.keywords?.length" class="flex flex-wrap gap-1.5" aria-label="Keywords">
              <li v-for="keyword in book.keywords" :key="keyword">
                <button
                  type="button"
                  class="border border-line hover:border-line-strong rounded-card t-meta transition-colors duration-150 px-2.5 py-1"
                  @click="searchFor(keyword)"
                >
                  {{ keyword }}
                </button>
              </li>
            </ul>
          </section>

          <section v-if="book.takeaways?.length" class="flex flex-col gap-1">
            <h2 class="t-label border-b border-line-strong pb-2">Aprendizajes</h2>
            <ol class="flex flex-col">
              <li
                v-for="(idea, i) in book.takeaways"
                :key="i"
                class="grid grid-cols-[2rem_1fr] gap-2 border-b border-line-subtle t-body py-3.5"
              >
                <span class="font-serif text-[22px] leading-[1.1] tabular">{{ i + 1 }}</span>
                <span>{{ idea }}</span>
              </li>
            </ol>
          </section>
        </div>

        <UiEmptyState
          v-if="!book.summary && !book.takeaways?.length && !book.notes"
          message="Sin notas todavía."
          icon="i-ph-note-pencil"
        >
          <UButton label="Agregar notas" color="neutral" variant="subtle" @click="openForm(book)" />
        </UiEmptyState>
      </div>
    </article>

    <UModal v-model:open="confirmOpen" title="¿Borrar este libro?" :description="book ? `Se borra ${book.title} con sus notas. No se puede deshacer.` : ''">
      <template #footer>
        <div class="w-full flex justify-end gap-2">
          <UButton label="Cancelar" color="neutral" variant="ghost" @click="confirmOpen = false" />
          <UButton label="Borrar" color="error" :loading="deleting" @click="destroy" />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
const STEP_TOASTS = {
  por_leer: 'Pasó a por leer',
  leyendo: 'A leer',
  leido: 'Uno más a la biblioteca'
}

const route = useRoute()
const toast = useToast()
const { books, current: book, load, get, save, setPodium, remove } = useBooks()
const { openForm } = useBookForm()

const loading = ref(true)
const error = ref(null)
const confirmOpen = ref(false)
const deleting = ref(false)
const advancing = ref(false)
const savingPodium = ref(false)

const medal = computed(() => MEDAL_COLORS[book.value?.podium] || null)

const facts = computed(() => {
  const b = book.value
  if (!b) return []
  return [
    { label: 'Estado', value: b.status === 'leido' ? null : statusLabel(b.status) },
    { label: 'Leído', value: b.status === 'leido' ? formatMonth(b.finished_at) || 'Sin fecha' : null },
    { label: 'Tema', value: b.topic },
    { label: 'Páginas', value: b.pages ? formatNumber(b.pages) : null },
    { label: 'Publicado', value: b.published_year }
  ].filter(f => f.value)
})


const nextStep = computed(() => {
  if (book.value?.status === 'backlog') return { label: 'Lo compré', icon: 'i-ph-shopping-bag', status: 'por_leer', field: null }
  if (book.value?.status === 'por_leer') return { label: 'Empezar', icon: 'i-ph-book-open', status: 'leyendo', field: null }
  if (book.value?.status === 'leyendo') return { label: 'Terminado', icon: 'i-ph-check', status: 'leido', field: 'finished_at' }
  return null
})

const podiumYear = computed(() => yearOf(book.value?.finished_at))

function holdersFor(field, sameScope) {
  const holders = {}
  for (const b of books.value) {
    if (b[field] && b.id !== book.value?.id && sameScope(b)) holders[b[field]] = b.title
  }
  return holders
}

const yearHolders = computed(() => holdersFor('podium', b => yearOf(b.finished_at) === podiumYear.value))
const allHolders = computed(() => holdersFor('podium_all', () => true))

const siblings = computed(() => {
  const status = book.value?.status
  const list = books.value.filter(b => b.status === status)
  if (['por_leer', 'backlog'].includes(status)) list.sort((a, b) => a.sort_order - b.sort_order)
  const index = list.findIndex(b => b.id === book.value?.id)
  return { list, index, prev: list[index - 1] || null, next: list[index + 1] || null }
})

const search = useState('books:search', () => '')

const mobileActions = computed(() => {
  const b = book.value
  if (!b) return []
  return [[
    ...(nextStep.value ? [{ label: nextStep.value.label, icon: nextStep.value.icon, onSelect: advance }] : []),
    ...(b.notes ? [{ label: 'Notas', icon: 'i-ph-article', to: `/libros/${b.id}/notas` }] : []),
    { label: 'Editar', icon: 'i-ph-pencil-simple', onSelect: () => openForm(b) },
    { label: 'Borrar', icon: 'i-ph-trash', color: 'error', onSelect: () => { confirmOpen.value = true } }
  ]]
})

function searchFor(keyword) {
  search.value = keyword
  navigateTo('/')
}

const backTo = computed(() => {
  const status = book.value?.status
  return !status || status === 'leido' ? '/' : { path: '/', query: { estado: status } }
})

const backLabel = computed(() => STATUSES.find(s => s.value === book.value?.status)?.plural || 'Biblioteca')

useHead(() => ({ title: book.value ? `${book.value.title} · Libros` : 'Libros' }))

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function fetchBook() {
  loading.value = book.value?.id !== route.params.id
  error.value = null
  try {
    await get(route.params.id)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function advance() {
  const step = nextStep.value
  advancing.value = true
  try {
    const changes = { id: book.value.id, status: step.status }
    if (step.field) changes[step.field] = today()
    await save(changes)
    toast.add({ title: STEP_TOASTS[step.status], icon: 'i-ph-check' })
  } catch (err) {
    toast.add({ title: 'No se pudo actualizar', description: err.message, color: 'error' })
  } finally {
    advancing.value = false
  }
}

async function rate(value) {
  try {
    await save({ id: book.value.id, rating: value })
  } catch (err) {
    toast.add({ title: 'No se pudo guardar el puntaje', description: err.message, color: 'error' })
  }
}

async function togglePodium(place, field) {
  savingPodium.value = true
  try {
    await setPodium(book.value, place, field)
  } catch (err) {
    toast.add({ title: 'No se pudo guardar el podio', description: err.message, color: 'error' })
  } finally {
    savingPodium.value = false
  }
}

async function destroy() {
  deleting.value = true
  try {
    await remove(book.value.id)
    confirmOpen.value = false
    toast.add({ title: 'Libro borrado', icon: 'i-ph-trash' })
    await navigateTo('/')
  } catch (err) {
    toast.add({ title: 'No se pudo borrar', description: err.message, color: 'error' })
  } finally {
    deleting.value = false
  }
}

watch(() => route.params.id, fetchBook)

onMounted(() => {
  fetchBook()
  if (!books.value.length) load()
})
</script>
