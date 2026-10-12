<template>
  <div class="flex flex-col gap-8">
    <UiErrorNote :message="error" :on-retry="load" />

    <BookSearchResults v-if="search.trim() && !loading" :query="search" />

    <div v-else-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-10">
      <div v-for="n in 10" :key="n" class="aspect-2/3 skeleton" />
    </div>

    <UiEmptyState v-else-if="!filtered.length" :message="emptyMessage">
      <UButton v-if="!books.length" icon="i-ph-plus" label="Agregar el primero" @click="openForm()" />
    </UiEmptyState>

    <div v-else class="flex flex-col gap-14">
      <section v-for="group in groups" :key="group.key" class="flex flex-col gap-5">
        <div v-if="group.label" class="flex items-baseline justify-between gap-4 border-b border-line pb-2">
          <h2 class="font-serif text-[32px] leading-none tabular">{{ group.label }}</h2>
          <span class="t-meta tabular">{{ group.books.length }} {{ group.books.length === 1 ? 'libro' : 'libros' }}</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-10">
          <BookCard
            v-for="(book, i) in group.books"
            :key="book.id"
            :book="book"
            :position="status === 'por_leer' ? i + 1 : null"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { books, loading, error, load } = useBooks()
const { openForm } = useBookForm()
const search = useState('books:search', () => '')

const status = computed(() => route.query.estado || 'leido')

const filtered = computed(() => {
  const list = books.value.filter(b => b.status === status.value)
  if (['por_leer', 'backlog'].includes(status.value)) return [...list].sort((a, b) => a.sort_order - b.sort_order)
  return list
})

const groups = computed(() => {
  if (status.value !== 'leido') return [{ key: 'all', label: null, books: filtered.value }]
  const byYear = new Map()
  for (const book of filtered.value) {
    const year = book.finished_at?.slice(0, 4) || 'Sin fecha'
    if (!byYear.has(year)) byYear.set(year, [])
    byYear.get(year).push(book)
  }
  const byPodium = (a, b) => (a.podium || 4) - (b.podium || 4)
  return [...byYear].map(([year, list]) => ({ key: year, label: year, books: [...list].sort(byPodium) }))
})

const emptyMessage = computed(() => {
  if (!books.value.length) return 'Todavía no cargaste ningún libro.'
  return 'No hay libros en este estado.'
})

onMounted(load)
</script>
