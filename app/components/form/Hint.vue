<template>
    <div class="relative group flex">
        <Icon name="tabler:info-circle" class="text-secondary cursor-pointer lg:text-xl" />
        <div class="max-w-96 absolute bottom-full -left-0.5 z-10 bg-terciary text-dark text-sm rounded-[5px] whitespace-pre opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 mb-2 px-3 py-1.5">
            {{ text }}
            <div class="absolute top-full left-2 border-4 border-transparent border-t-terciary"></div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    text: {
        type: String,
        required: true
    }
})
</script>
