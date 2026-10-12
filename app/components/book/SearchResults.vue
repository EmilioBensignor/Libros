<template>
  <section class="flex flex-col gap-4">
    <div class="flex items-baseline justify-between gap-4 border-b border-line pb-2">
      <h2 class="font-serif text-[32px] leading-none">Resultados</h2>
      <span class="t-meta tabular">{{ results.length }} {{ results.length === 1 ? 'libro' : 'libros' }}</span>
    </div>

    <UiEmptyState v-if="!results.length" message="Nada coincide con la búsqueda." icon="i-ph-magnifying-glass" />

    <ul v-else class="flex flex-col">
      <li v-for="r in results" :key="r.book.id" class="border-b border-line-subtle">
        <NuxtLink
          :to="`/libros/${r.book.id}`"
          class="flex items-start gap-4 hover:bg-surface rounded-card transition-colors duration-150 px-2 py-3 -mx-2"
        >
          <div class="w-12 shrink-0">
            <BookCover :book="r.book" />
          </div>
          <div class="min-w-0 flex flex-col gap-1">
            <p class="t-strong">{{ r.book.title }}</p>
            <p class="t-meta">{{ [r.book.author, statusLabel(r.book.status)].filter(Boolean).join(' · ') }}</p>
            <p v-if="r.text" class="max-w-[80ch] t-meta">
              <span class="font-medium">{{ r.field }}:</span> {{ r.text }}
            </p>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup>
const props = defineProps({
  query: { type: String, required: true }
})

const { books } = useBooks()

const results = computed(() => searchLibrary(books.value, props.query))
</script>
