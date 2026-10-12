<template>
  <div
    v-if="message"
    class="flex items-start gap-2.5 bg-neg/15 border border-neg/30 rounded-panel px-3.5 py-3"
    role="alert"
  >
    <UIcon name="i-ph-warning" class="size-4 shrink-0 text-neg mt-1" />
    <p class="flex-1 min-w-0 t-body text-ink">
      {{ message }}
    </p>
    <UButton
      v-if="onRetry"
      label="Reintentar"
      color="neutral"
      variant="ghost"
      size="xs"
      class="shrink-0"
      @click="onRetry"
    />
  </div>
</template>

<script setup>
defineProps({
  message: { type: String, default: null },
  onRetry: { type: Function, default: null }
})
</script>
