<template>
  <NuxtLink
    :to="`/libros/${book.id}`"
    class="group flex flex-col gap-2.5 rounded-[4px] outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-4 focus-visible:ring-offset-bg"
    :aria-label="`${book.title}${book.author ? `, de ${book.author}` : ''}`"
  >
    <div
      class="relative rounded-[6px] transition-transform duration-200 ease-out group-hover:-translate-y-1 group-active:scale-[0.98]"
      :style="medal ? { outline: `3px solid ${medal}`, outlineOffset: '2px' } : null"
    >
      <BookCover :book="book" />
      <span
        v-if="book.podium"
        class="size-9 flex items-center justify-center absolute -top-3 -right-3 rounded-full font-serif text-[18px] text-white leading-none tabular shadow-[0_4px_12px_rgba(12,10,9,0.3)]"
        :style="{ backgroundColor: medal }"
        :aria-label="`Puesto ${book.podium} del año`"
      >
        {{ PODIUM_LABELS[book.podium] }}
      </span>
    </div>
    <p v-if="caption" class="t-meta text-ink tabular">
      {{ caption }}
    </p>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  book: { type: Object, required: true },
  position: { type: Number, default: null }
})

const medal = computed(() => MEDAL_COLORS[props.book.podium] || null)

const caption = computed(() => {
  const { book } = props
  if (book.status === 'por_leer') return props.position ? `Siguiente ${props.position}` : null
  if (book.status === 'leyendo') return 'Leyendo'
  const parts = []
  if (book.finished_at) parts.push(formatMonth(book.finished_at))
  if (book.rating) parts.push(`${formatRating(book.rating)} ★`)
  return parts.join(' · ') || null
})
</script>
