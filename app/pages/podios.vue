<template>
  <div class="flex flex-col gap-14">
    <UiErrorNote :message="error" :on-retry="load" />

    <section class="flex flex-col gap-6">
      <div class="flex items-baseline justify-between gap-4 border-b border-line pb-2">
        <h2 class="font-serif text-[32px] leading-none">General</h2>
        <span class="t-meta">4° y 5° son menciones</span>
      </div>
      <div class="w-full max-w-4xl flex sm:grid sm:grid-cols-5 gap-6 sm:gap-10 overflow-x-auto sm:overflow-visible overscroll-x-contain scrollbar-none -mx-4 sm:mx-0 px-5 sm:px-1.5 pt-2 pb-1">
        <BookPodiumSlot v-for="place in [1, 2, 3, 4, 5]" :key="place" :place="place" :book="overall[place]" class="w-28 shrink-0 sm:w-auto" />
      </div>
    </section>

    <section v-for="year in years" :key="year.label" class="flex flex-col gap-6">
      <div class="flex items-baseline justify-between gap-4 border-b border-line pb-2">
        <h2 class="font-serif text-[32px] leading-none tabular">{{ year.label }}</h2>
        <span class="t-meta tabular">{{ year.count }} {{ year.count === 1 ? 'libro' : 'libros' }}</span>
      </div>
      <div class="w-full max-w-4xl flex sm:grid sm:grid-cols-5 gap-6 sm:gap-10 overflow-x-auto sm:overflow-visible overscroll-x-contain scrollbar-none -mx-4 sm:mx-0 px-5 sm:px-1.5 pt-2 pb-1">
        <BookPodiumSlot v-for="place in year.places" :key="place" :place="place" :book="year.podium[place]" class="w-28 shrink-0 sm:w-auto" />
      </div>
    </section>
  </div>
</template>

<script setup>
const { books, error, load } = useBooks()

const read = computed(() => books.value.filter(b => b.status === 'leido'))

const overall = computed(() => Object.fromEntries(
  read.value.filter(b => b.podium_all).map(b => [b.podium_all, b])
))

const years = computed(() => {
  const byYear = new Map()
  for (const book of read.value) {
    const year = yearOf(book.finished_at)
    if (!year) continue
    if (!byYear.has(year)) byYear.set(year, { label: year, count: 0, podium: {} })
    const entry = byYear.get(year)
    entry.count++
    if (book.podium) entry.podium[book.podium] = book
  }
  const currentYear = String(new Date().getFullYear())
  return [...byYear.values()]
    .map(y => ({ ...y, places: y.label === currentYear ? [1, 2, 3] : [1, 2, 3].filter(p => y.podium[p]) }))
    .filter(y => y.places.length)
    .sort((a, b) => b.label.localeCompare(a.label))
})

useHead({ title: 'Podios · Libros' })

onMounted(load)
</script>
