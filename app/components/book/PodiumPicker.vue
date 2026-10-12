<template>
  <div class="flex items-center justify-between gap-3">
    <span class="t-strong tabular">{{ label }}</span>
    <div class="flex gap-1" role="radiogroup" :aria-label="label">
      <button
        v-for="place in [1, 2, 3]"
        :key="place"
        type="button"
        role="radio"
        class="size-10 border-2 rounded-full font-serif text-[18px] leading-none tabular transition-colors duration-150 active:scale-95"
        :class="modelValue === place ? 'text-white' : 'border-line hover:border-line-strong'"
        :style="modelValue === place ? { backgroundColor: MEDAL_COLORS[place], borderColor: MEDAL_COLORS[place] } : null"
        :aria-checked="modelValue === place"
        :title="holders[place] ? `Hoy: ${holders[place]}` : 'Libre'"
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
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])
</script>
