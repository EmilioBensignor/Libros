<template>
  <div class="flex items-center gap-3">
    <div class="flex items-center" role="radiogroup" aria-label="Puntaje" @mouseleave="hover = null">
      <span v-for="n in 5" :key="n" class="size-9 relative">
        <UIcon name="i-ph-star" class="size-7 absolute inset-1 pointer-events-none text-ink" />
        <UIcon
          v-if="shown >= n - 0.5"
          name="i-ph-star-fill"
          class="size-7 absolute inset-1 pointer-events-none text-gold"
          :style="shown < n ? { clipPath: 'inset(0 50% 0 0)' } : null"
        />
        <button
          v-for="half in [0.5, 1]"
          :key="half"
          type="button"
          role="radio"
          class="w-1/2 h-full absolute top-0"
          :class="half === 0.5 ? 'left-0' : 'right-0'"
          :aria-checked="value === n - 1 + half"
          :aria-label="`${formatRating(n - 1 + half)} de 5`"
          @mouseenter="hover = n - 1 + half"
          @click="choose(n - 1 + half)"
        />
      </span>
    </div>
    <span class="t-strong tabular w-8">{{ formatRating(shown) }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: [Number, String], default: null }
})

const emit = defineEmits(['update:modelValue'])

const hover = ref(null)

const value = computed(() => Number(props.modelValue) || 0)
const shown = computed(() => hover.value ?? value.value)

function choose(rating) {
  hover.value = null
  emit('update:modelValue', value.value === rating ? null : rating)
}
</script>
