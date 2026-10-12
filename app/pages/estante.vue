<template>
  <div class="flex flex-col gap-10">
    <UiErrorNote :message="error" :on-retry="load" />

    <div v-if="loading" class="w-full h-72 skeleton" />

    <UiEmptyState v-else-if="!read.length" message="No hay libros en este estado." icon="i-ph-books" />

    <div v-else ref="shelfRef" class="flex flex-col gap-6 -mt-6 md:-mt-4">
      <div v-for="(row, i) in rows" :key="i" class="flex flex-col">
        <div class="flex items-end gap-0.5 pt-6 px-2">
          <BookShelfBook
            v-for="item in row"
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
const GAP = 2
const BOOKS_PER_WAVE = 6
const SIDE_PADDING = 16

const route = useRoute()
const { books, loading, error, load } = useBooks()

const shelfRef = ref(null)
const shelfWidth = ref(0)
const size = ref('desktop')

let observer = null

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

const rows = computed(() => {
  const available = shelfWidth.value - SIDE_PADDING
  if (available <= 0) return [items.value]
  const result = [[]]
  let used = 0
  for (const item of items.value) {
    const needed = item.width + (used ? GAP : 0)
    if (used && used + needed > available) {
      result.push([])
      used = 0
    }
    result[result.length - 1].push(item)
    used += item.width + (used ? GAP : 0)
  }
  return result
})

function measure() {
  if (!shelfRef.value) return
  shelfWidth.value = shelfRef.value.clientWidth
  size.value = window.innerWidth < 768 ? 'mobile' : 'desktop'
}

useHead({ title: 'Estante · Libros' })

watch(shelfRef, (el) => {
  observer?.disconnect()
  if (!el) return
  observer = new ResizeObserver(measure)
  observer.observe(el)
  measure()
})

onMounted(load)

onBeforeUnmount(() => observer?.disconnect())
</script>
