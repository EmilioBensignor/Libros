<template>
  <div class="flex gap-0.5 border border-line rounded-card p-0.5" role="tablist" aria-label="Vista">
    <NuxtLink
      v-for="view in VIEWS"
      :key="view.to"
      :to="{ path: view.to, query: route.query }"
      role="tab"
      class="flex items-center gap-1.5 rounded-[6px] t-strong transition-colors duration-150 active:scale-[0.97] px-2 sm:px-2.5 py-1"
      :class="route.path === view.to ? 'bg-ink text-bg' : 'hover:bg-surface'"
      :aria-selected="route.path === view.to"
      :aria-label="view.label"
    >
      <UIcon :name="view.icon" class="size-5 shrink-0" />
      <span class="hidden lg:inline">{{ view.label }}</span>
    </NuxtLink>
  </div>
</template>

<script setup>
const VIEWS = [
  { to: '/', label: 'Portadas', icon: 'i-ph-squares-four' },
  { to: '/estante', label: 'Estante', icon: 'i-ph-books' }
]

const route = useRoute()
</script>
