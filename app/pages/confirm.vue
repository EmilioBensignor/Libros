<template>
  <div class="min-h-dvh flex items-center justify-center bg-bg px-6">
    <div class="flex flex-col items-center gap-3 text-center">
      <template v-if="!stalled">
        <UIcon
          name="i-ph-circle-notch"
          class="size-6 text-ink animate-spin"
        />
        <p class="t-body text-ink">
          Entrando…
        </p>
      </template>

      <template v-else>
        <UIcon
          name="i-ph-warning"
          class="size-6 text-neg"
        />
        <p class="t-body text-ink">
          No pudimos confirmar la sesión.
        </p>
        <UButton
          to="/login"
          label="Volver a entrar"
          color="neutral"
          variant="subtle"
          size="sm"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const STALL_MS = 8000

const user = useSupabaseUser()
const stalled = ref(false)

let timer = null

watchEffect(() => {
  if (user.value) navigateTo('/')
})

onMounted(() => {
  timer = setTimeout(() => {
    if (!user.value) stalled.value = true
  }, STALL_MS)
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>
