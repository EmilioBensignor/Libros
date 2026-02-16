<template>
    <div v-if="isOpen" @click="$emit('close')"
        class="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
        <button @click="$emit('close')" class="absolute top-4 right-4 z-10 hover:scale-110 transition-transform">
            <Icon name="tabler:x" class="w-8 h-8 text-light" />
        </button>
        <img :src="imageUrl" alt="Imagen ampliada" class="max-w-full max-h-full object-contain rounded-lg"
            @click.stop />
    </div>
</template>

<script setup>
const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    imageUrl: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['close'])
</script>
