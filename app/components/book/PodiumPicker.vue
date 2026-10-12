<template>
  <div class="flex items-center justify-between gap-3">
    <span class="t-strong tabular">{{ label }}</span>
    <div class="flex gap-0.5" role="radiogroup" :aria-label="label">
      <button
        v-for="place in places"
        :key="place"
        type="button"
        role="radio"
        class="size-9 border-2 rounded-full font-serif text-[17px] leading-none tabular transition-colors duration-150 active:scale-95"
        :class="modelValue === place ? 'text-white' : 'border-line hover:border-line-strong'"
        :style="modelValue === place ? { backgroundColor: MEDAL_COLORS[place], borderColor: MEDAL_COLORS[place] } : null"
        :aria-checked="modelValue === place"
        :title="place > 3 ? `Mención${holders[place] ? `, hoy: ${holders[place]}` : ''}` : holders[place] ? `Hoy: ${holders[place]}` : 'Libre'"
        :disabled="disabled"
        @click="emit('update:modelValue', modelValue === place ? null : place)"
      >
        {{ PODIUM_LABELS[place] }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Number, default: null },
  label: { type: String, required: true },
  holders: { type: Object, default: () => ({}) },
  places: { type: Array, default: () => [1, 2, 3] },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])
</script>
