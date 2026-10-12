<template>
  <div class="min-h-dvh flex flex-col bg-bg text-ink">
    <header class="sticky top-0 z-30 bg-bg/90 backdrop-blur-md border-b border-line pt-[env(safe-area-inset-top)]">
      <div class="w-full max-w-400 h-15 flex items-stretch gap-8 mx-auto px-4 sm:px-6 md:px-10 xl:px-14">
        <NuxtLink to="/" class="flex items-center font-serif text-[28px] leading-none" @click="search = ''">
          Libros
        </NuxtLink>

        <BookStatusTabs v-if="isLibrary" class="hidden md:flex" />

        <div class="flex items-center gap-1 ml-auto">
          <UInput
            v-model="search"
            icon="i-ph-magnifying-glass"
            placeholder="Buscar en toda la biblioteca"
            variant="soft"
            class="hidden md:block w-72"
            aria-label="Buscar por título, autor, resumen, aprendizajes o keywords"
          >
            <template v-if="search" #trailing>
              <UButton icon="i-ph-x" color="neutral" variant="link" size="xs" aria-label="Borrar búsqueda" @click="search = ''" />
            </template>
          </UInput>
          <BookViewToggle v-if="isLibrary" class="mr-1" />
          <UButton to="/podios" icon="i-ph-trophy" color="neutral" variant="ghost" class="hidden md:inline-flex" label="Podios" />
          <UButton icon="i-ph-plus" color="neutral" class="hidden md:inline-flex" label="Agregar" @click="openForm()" />
          <UButton icon="i-ph-sign-out" color="neutral" variant="ghost" aria-label="Cerrar sesión" @click="logoutOpen = true" />
        </div>
      </div>

      <div v-if="isLibrary || searchOpen" class="md:hidden flex flex-col gap-3 px-4 sm:px-6">
        <UInput
          v-if="searchOpen"
          ref="mobileSearch"
          v-model="search"
          icon="i-ph-magnifying-glass"
          placeholder="Buscar en toda la biblioteca"
          variant="soft"
          size="lg"
          class="w-full"
          aria-label="Buscar en toda la biblioteca"
        >
          <template #trailing>
            <UButton icon="i-ph-x" color="neutral" variant="link" size="xs" aria-label="Cerrar búsqueda" @click="closeSearch" />
          </template>
        </UInput>
        <BookStatusTabs v-if="isLibrary && !search" class="[&>button]:pb-2.5" />
        <div v-else class="h-1" />
      </div>
    </header>

    <main class="w-full max-w-400 flex-1 mx-auto px-4 sm:px-6 md:px-10 xl:px-14 pt-6 md:pt-10 pb-[calc(env(safe-area-inset-bottom)+6rem)] md:pb-12">
      <slot />
    </main>

    <nav
      class="md:hidden grid grid-cols-4 fixed bottom-0 inset-x-0 z-30 bg-bg/95 backdrop-blur-md border-t border-line pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegación"
    >
      <button
        v-for="item in navItems"
        :key="item.label"
        type="button"
        class="flex flex-col items-center gap-0.5 text-[12px] transition-transform duration-150 active:scale-95 py-2.5"
        :class="item.active ? 'font-semibold' : 'font-normal'"
        :aria-current="item.active ? 'page' : undefined"
        @click="item.onClick"
      >
        <UIcon :name="item.active ? `${item.icon}-fill` : item.icon" class="size-6" />
        {{ item.label }}
      </button>
    </nav>

    <BookForm />

    <UModal v-model:open="logoutOpen" title="¿Cerrar sesión?">
      <template #footer>
        <div class="w-full flex justify-end gap-2">
          <UButton label="Cancelar" color="neutral" variant="ghost" @click="logoutOpen = false" />
          <UButton label="Cerrar sesión" color="neutral" :loading="loggingOut" @click="logout" />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
const client = useSupabaseClient()
const route = useRoute()
const { openForm } = useBookForm()
const search = useState('books:search', () => '')

const searchOpen = ref(false)
const logoutOpen = ref(false)
const loggingOut = ref(false)
const mobileSearch = ref(null)

const isHome = computed(() => route.path === '/')
const isLibrary = computed(() => ['/', '/estante'].includes(route.path))

const navItems = computed(() => [
  { label: 'Biblioteca', icon: 'i-ph-books', active: isLibrary.value && !searchOpen.value, onClick: () => go(route.path === '/estante' ? '/estante' : '/') },
  { label: 'Buscar', icon: 'i-ph-magnifying-glass', active: searchOpen.value, onClick: openSearch },
  { label: 'Agregar', icon: 'i-ph-plus-circle', active: false, onClick: () => openForm() },
  { label: 'Podios', icon: 'i-ph-trophy', active: route.path === '/podios', onClick: () => go('/podios') }
])

watch(search, (value) => {
  if (value.trim() && !isHome.value) navigateTo('/')
})

function go(path) {
  closeSearch()
  navigateTo(path)
}

async function openSearch() {
  searchOpen.value = true
  await nextTick()
  mobileSearch.value?.inputRef?.focus()
}

function closeSearch() {
  searchOpen.value = false
  search.value = ''
}

async function logout() {
  loggingOut.value = true
  await client.auth.signOut()
  logoutOpen.value = false
  loggingOut.value = false
  await navigateTo('/login')
}
</script>
