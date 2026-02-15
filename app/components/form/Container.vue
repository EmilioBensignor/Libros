<template>
    <form class="w-full max-w-[56.25rem] flex flex-col items-center" @submit.prevent="$emit('submit')">
        <slot />
    </form>
</template>

<script setup>
defineEmits(['submit'])
</script>