<template>
  <div class="min-h-dvh flex items-center justify-center bg-bg px-6 py-10">
    <div class="w-full max-w-90 flex flex-col gap-7">
      <h1 class="font-serif text-[48px] leading-none text-ink text-center">
        Libros
      </h1>

      <UiErrorNote
        v-if="formError"
        :message="formError"
      />

      <form
        class="flex flex-col gap-4"
        novalidate
        @submit.prevent="submit"
      >
        <div class="flex flex-col gap-1.5">
          <label
            for="login-email"
            class="t-label text-ink"
          >
            Email
          </label>
          <UInput
            id="login-email"
            v-model="email"
            type="email"
            placeholder="tu@email.com"
            size="lg"
            autocomplete="email"
            autocapitalize="none"
            spellcheck="false"
            inputmode="email"
            class="w-full"
            :ui="fieldUi"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label
            for="login-password"
            class="t-label text-ink"
          >
            Contraseña
          </label>
          <UInput
            id="login-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Tu contraseña"
            size="lg"
            autocomplete="current-password"
            class="w-full"
            :ui="fieldUi"
          >
            <template #trailing>
              <button
                type="button"
                class="size-6 flex items-center justify-center text-ink rounded-card p-0"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                :aria-pressed="showPassword"
                @click="showPassword = !showPassword"
              >
                <UIcon
                  :name="showPassword ? 'i-ph-eye-slash' : 'i-ph-eye'"
                  class="size-5"
                />
              </button>
            </template>
          </UInput>
        </div>

        <UButton
          type="submit"
          label="Entrar"
          size="lg"
          block
          :loading="loading"
          :disabled="!canSubmit"
          :ui="{ base: 'min-h-11 justify-center' }"
          class="mt-1"
        />
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const ERROR_MESSAGES = {
  invalid_credentials: 'Email o contraseña incorrectos.',
  email_not_confirmed: 'Confirmá tu email antes de entrar.',
  over_request_rate_limit: 'Demasiados intentos. Esperá un momento.',
  validation_failed: 'Revisá los datos ingresados.'
}

const client = useSupabaseClient()
const user = useSupabaseUser()

const email = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)
const formError = ref('')

const fieldUi = {
  base: 'bg-surface text-ink placeholder:text-ink/40 focus-visible:ring-2 focus-visible:ring-accent-400',
  trailing: 'pe-2'
}

const canSubmit = computed(() => !loading.value && email.value.trim() !== '' && password.value !== '')

watchEffect(() => {
  if (user.value) navigateTo('/')
})

function messageFor(err) {
  return ERROR_MESSAGES[err?.code] || err?.message || 'Algo salió mal. Probá de nuevo.'
}

async function submit() {
  if (!canSubmit.value) return
  formError.value = ''
  loading.value = true

  const { data, error: err } = await client.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value
  })
  loading.value = false
  if (err) {
    formError.value = messageFor(err)
    return
  }
  if (data?.session) await navigateTo('/')
}
</script>
