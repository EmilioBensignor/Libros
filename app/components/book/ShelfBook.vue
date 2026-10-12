<template>
  <NuxtLink
    :to="`/libros/${book.id}`"
    class="group shrink-0 relative outline-none"
    :style="{ width: `${width}px`, height: `${height}px` }"
    :aria-label="`${book.title}${book.author ? `, de ${book.author}` : ''}`"
  >
    <span
      class="size-full flex flex-col items-center overflow-hidden rounded-t-[3px] rounded-b-[2px] transition-[translate,scale] duration-200 ease-out group-hover:-translate-y-4 group-hover:scale-[1.04] group-focus-visible:-translate-y-4 group-focus-visible:scale-[1.04] group-active:scale-100 motion-reduce:transition-none px-1 py-1.5"
      :style="spineStyle"
    >
      <span class="w-full h-[3px] shrink-0 rounded-full mt-1" :style="bandStyle" />
      <span class="w-full h-px shrink-0 mt-1" :style="bandStyle" />
      <span
        class="min-h-0 flex-1 flex items-center justify-center font-serif text-center leading-[1.05] wrap-break-word overflow-hidden [writing-mode:vertical-rl] py-3"
        :style="{ color: inkColor, fontSize: `${fontSize}px` }"
      >
        {{ book.title }}
      </span>
      <span
        v-if="medal"
        class="size-3 shrink-0 rounded-full mb-2"
        :style="{ backgroundColor: medal, boxShadow: `0 0 0 2px ${inkColor}` }"
      />
      <span class="w-full h-px shrink-0 mb-1" :style="bandStyle" />
      <span class="w-full h-[3px] shrink-0 rounded-full mb-1" :style="bandStyle" />
    </span>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  book: { type: Object, required: true },
  height: { type: Number, required: true },
  width: { type: Number, required: true }
})

const color = computed(() => props.book.spine_color || topicColor(props.book.topic))
const medal = computed(() => MEDAL_COLORS[props.book.podium] || null)
const fontSize = computed(() => Math.round(Math.min(22, Math.max(12, props.width * 0.6))))

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const inkColor = computed(() => {
  const bg = luminance(color.value)
  const onWhite = (1.05) / (bg + 0.05)
  const onBlack = (bg + 0.05) / 0.05
  return onBlack >= onWhite ? '#0c0a09' : '#ffffff'
})

const bandStyle = computed(() => ({ backgroundColor: inkColor.value, opacity: 0.5 }))

const spineStyle = computed(() => ({
  backgroundColor: color.value,
  backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.22) 0%, rgba(255,255,255,0.16) 14%, rgba(255,255,255,0) 32%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.24) 100%)',
  boxShadow: 'inset 0 0 0 1px rgba(12,10,9,0.16), 0 8px 16px -10px rgba(12,10,9,0.55)'
}))
</script>
