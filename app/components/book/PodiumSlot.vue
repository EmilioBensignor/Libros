<template>
  <component
    :is="book ? NuxtLink : 'div'"
    :to="book ? `/libros/${book.id}` : undefined"
    :aria-label="book ? `${PODIUM_LABELS[place]}: ${book.title}` : undefined"
    class="group min-w-0 flex flex-col items-center gap-3 text-center"
  >
    <div
      v-if="book"
      class="w-full rounded-[6px] transition-transform duration-200 ease-out group-hover:-translate-y-1"
      :style="{ outline: `3px solid ${MEDAL_COLORS[place]}`, outlineOffset: '2px' }"
    >
      <BookCover :book="book" />
    </div>
    <div v-else class="w-full aspect-2/3 flex items-center justify-center border-2 border-dashed border-line rounded-[4px]">
      <span class="t-meta">Sin elegir</span>
    </div>

    <span
      class="size-9 flex items-center justify-center rounded-full font-serif text-[18px] text-white leading-none tabular"
      :style="{ backgroundColor: MEDAL_COLORS[place] }"
    >
      {{ PODIUM_LABELS[place] }}
    </span>
  </component>
</template>

<script setup>
import { NuxtLink } from '#components'

defineProps({
  place: { type: Number, required: true },
  book: { type: Object, default: null }
})
</script>
