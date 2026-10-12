<template>
  <nav class="flex gap-5 overflow-x-auto scrollbar-none" role="tablist" aria-label="Estado">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      role="tab"
      class="border-b-2 t-strong whitespace-nowrap transition-colors duration-150"
      :class="status === tab.value ? 'border-ink' : 'border-transparent hover:border-line-strong'"
      :aria-selected="status === tab.value"
      @click="setStatus(tab.value)"
    >
      {{ tab.label }}
    </button>
  </nav>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const { books } = useBooks()

const status = computed(() => route.query.estado || 'leido')

const tabs = computed(() => STATUSES
  .filter(s => s.value !== 'abandonado' || status.value === 'abandonado' || books.value.some(b => b.status === 'abandonado'))
  .map(s => ({ value: s.value, label: s.plural })))

function setStatus(value) {
  router.replace({ path: route.path, query: value === 'leido' ? {} : { estado: value } })
}
</script>
