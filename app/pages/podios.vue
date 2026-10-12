<template>
  <div class="flex flex-col gap-14">
    <UiErrorNote :message="error" :on-retry="load" />

    <section class="flex flex-col items-center gap-8">
      <h1 class="font-serif text-[44px] sm:text-[56px] leading-none text-center">Podio general</h1>
      <div class="w-full max-w-3xl grid grid-cols-3 items-start gap-4 sm:gap-8">
        <BookPodiumSlot :place="2" :book="overall[2]" class="sm:pt-10" />
        <BookPodiumSlot :place="1" :book="overall[1]" />
        <BookPodiumSlot :place="3" :book="overall[3]" class="sm:pt-16" />
      </div>
    </section>

    <section v-for="year in years" :key="year.label" class="flex flex-col gap-6">
      <div class="flex items-baseline justify-between gap-4 border-b border-line pb-2">
        <h2 class="font-serif text-[32px] leading-none tabular">{{ year.label }}</h2>
        <span class="t-meta tabular">{{ year.count }} {{ year.count === 1 ? 'libro' : 'libros' }}</span>
      </div>
      <div class="w-full max-w-2xl grid grid-cols-3 gap-4 sm:gap-8">
        <BookPodiumSlot v-for="place in [1, 2, 3]" :key="place" :place="place" :book="year.podium[place]" />
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
  return [...byYear.values()].sort((a, b) => b.label.localeCompare(a.label))
})

useHead({ title: 'Podios · Libros' })

onMounted(load)
</script>
