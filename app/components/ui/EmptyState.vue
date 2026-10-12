<template>
  <div class="flex flex-col items-center justify-center gap-3 text-center px-6 py-16">
    <div class="size-11 flex items-center justify-center bg-surface-2 border border-line-subtle rounded-full">
      <UIcon :name="icon" class="size-5 shrink-0 text-ink" />
    </div>
    <p class="t-strong text-ink">
      {{ message }}
    </p>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  message: { type: String, required: true },
  icon: { type: String, default: 'i-ph-books' }
})
</script>
