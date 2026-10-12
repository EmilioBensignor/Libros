<template>
  <div class="flex flex-col gap-8">
    <header class="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line pb-5">
      <UButton
        :to="`/libros/${route.params.id}`"
        icon="i-ph-arrow-left"
        color="neutral"
        variant="subtle"
        aria-label="Volver a la ficha"
      />
      <div v-if="book" class="flex-1 min-w-0 flex flex-col">
        <h1 class="font-serif text-[30px] sm:text-[36px] leading-none truncate">{{ book.title }}</h1>
        <p class="t-meta truncate">Mis notas<template v-if="book.author"> · {{ book.author }}</template></p>
      </div>
      <UButton
        v-if="book?.drive_url"
        :to="book.drive_url"
        target="_blank"
        icon="i-ph-arrow-up-right"
        label="Drive"
        color="neutral"
        variant="ghost"
      />
    </header>

    <UiErrorNote :message="error" :on-retry="fetchBook" />

    <div v-if="loading" class="flex flex-col gap-4">
      <div class="w-2/3 h-8 skeleton" />
      <div class="w-full h-64 skeleton" />
    </div>

    <UiEmptyState v-else-if="!book?.notes" message="Este libro no tiene notas." icon="i-ph-note-pencil" />

    <article v-else class="prose-notes prose-reading wrap-break-word" v-html="notesHtml" />
  </div>
</template>

<script setup>
const route = useRoute()
const { current: book, get } = useBooks()

const loading = ref(true)
const error = ref(null)

const notesHtml = computed(() => renderNotes(book.value?.notes))

useHead(() => ({ title: book.value ? `Notas de ${book.value.title} · Libros` : 'Libros' }))

async function fetchBook() {
  loading.value = book.value?.id !== route.params.id
  error.value = null
  try {
    await get(route.params.id)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchBook)
</script>
