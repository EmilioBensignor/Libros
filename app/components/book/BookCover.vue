<template>
  <div class="w-full aspect-2/3 relative overflow-hidden bg-surface rounded-[4px] shadow-[0_1px_2px_rgba(12,10,9,0.12),0_12px_28px_-14px_rgba(12,10,9,0.45)]">
    <img
      v-if="showPhoto"
      :src="book.cover_url"
      :alt="`Portada de ${book.title}`"
      class="size-full object-cover"
      :loading="large ? 'eager' : 'lazy'"
      decoding="async"
      @error="failed = true"
    >

    <div
      v-else
      class="size-full flex flex-col justify-between text-cover-ink"
      :class="large ? 'p-6' : 'p-3 sm:p-4'"
      :style="coverStyle"
    >
      <span class="text-[11px] font-medium uppercase tracking-[0.08em]" :class="large ? 'sm:text-xs' : ''">
        {{ book.topic || 'Sin tema' }}
      </span>

      <div class="flex flex-col gap-2">
        <h3 class="font-serif leading-[1.02] wrap-break-word" :class="titleSize">
          {{ book.title }}
        </h3>
        <p v-if="book.author" class="text-[12px] font-medium leading-tight line-clamp-2" :class="large ? 'sm:text-sm' : ''">
          {{ book.author }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  book: { type: Object, required: true },
  large: { type: Boolean, default: false }
})

const failed = ref(false)

const showPhoto = computed(() => props.book.cover_url && !failed.value)

const coverStyle = computed(() => ({
  backgroundColor: topicColor(props.book.topic),
  backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.18) 0, rgba(0,0,0,0.04) 6%, rgba(255,255,255,0.12) 7%, transparent 9%)'
}))

const titleSize = computed(() => {
  const long = props.book.title.length > 24
  if (props.large) return long ? 'text-[34px] sm:text-[40px]' : 'text-[40px] sm:text-[48px]'
  return long ? 'text-[19px] sm:text-[22px]' : 'text-[23px] sm:text-[27px]'
})

watch(() => props.book.cover_url, () => {
  failed.value = false
})
</script>
