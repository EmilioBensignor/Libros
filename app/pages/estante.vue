<template>
  <div class="flex flex-col gap-10">
    <UiErrorNote :message="error" :on-retry="load" />

    <div v-if="loading" class="w-full h-72 skeleton" />

    <UiEmptyState v-else-if="!read.length" message="No hay libros en este estado." icon="i-ph-books" />

    <div v-else class="overflow-x-auto overscroll-x-contain scrollbar-none -mx-4 sm:-mx-6 md:mx-0 -mt-6 md:-mt-4">
      <div class="w-max min-w-full flex flex-col px-4 sm:px-6 md:px-0">
        <div class="flex items-end pt-6 px-2">
          <BookShelfBook
            v-for="item in items"
            :key="item.book.id"
            :book="item.book"
            :width="item.width"
            :height="item.height"
          />
        </div>
        <div class="h-3.5 bg-[#3b2f26] rounded-[2px] shadow-[0_14px_20px_-14px_rgba(12,10,9,0.55)]" aria-hidden="true" />
      </div>
    </div>
  </div>
</template>

<script setup>
const PX_PER_CM = { mobile: 12, desktop: 18 }
const CM_PER_PAGE = 0.0065
const HARDCOVER_MIN_HEIGHT_CM = 23.5
const BOARDS_CM = { hardcover: 0.5, paperback: 0.2 }
const BOOKS_PER_WAVE = 6

const route = useRoute()
const { books, loading, error, load } = useBooks()

const size = ref('desktop')

let media = null

const status = computed(() => route.query.estado || 'leido')

const read = computed(() => books.value.filter(b => b.status === status.value))

function organPipe(list) {
  const rising = list.filter((_, i) => i % 2 === 0)
  const falling = list.filter((_, i) => i % 2 === 1).reverse()
  return [...rising, ...falling]
}

const waved = computed(() => {
  const byHeight = [...read.value].sort((a, b) =>
    Number(a.height_cm || 22) - Number(b.height_cm || 22) || (a.pages || 0) - (b.pages || 0) || a.title.localeCompare(b.title))
  const waveCount = Math.max(1, Math.round(byHeight.length / BOOKS_PER_WAVE))
  const waves = Array.from({ length: waveCount }, () => [])
  byHeight.forEach((book, i) => waves[i % waveCount].push(book))
  return waves.flatMap(organPipe)
})

const items = computed(() => waved.value.map((book) => {
  const heightCm = Number(book.height_cm || 22)
  const boards = heightCm >= HARDCOVER_MIN_HEIGHT_CM ? BOARDS_CM.hardcover : BOARDS_CM.paperback
  const thicknessCm = (book.pages || 250) * CM_PER_PAGE + boards
  return {
    book,
    height: Math.round(heightCm * PX_PER_CM[size.value]),
    width: Math.round(thicknessCm * PX_PER_CM[size.value])
  }
}))

function updateSize() {
  size.value = media?.matches ? 'mobile' : 'desktop'
}

useHead({ title: 'Estante · Libros' })

onMounted(() => {
  media = window.matchMedia('(max-width: 767px)')
  updateSize()
  media.addEventListener('change', updateSize)
  load()
})

onBeforeUnmount(() => media?.removeEventListener('change', updateSize))
</script>
