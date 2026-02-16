<template>
    <NuxtLink :to="`/books/${book.id}`" class="book-card" @mouseenter="handleMouseEnter" @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave" :style="cardStyle" @keydown.enter="navigateToBook"
        @keydown.space.prevent="navigateToBook">
        <!-- Cover/Placeholder -->
        <div class="book-card-cover">
            <img v-if="coverUrl" :src="coverUrl" :alt="book.title" class="book-card-image" />
            <div v-else class="book-card-placeholder" :style="{ backgroundColor: book.color_representativo?.hex || '#E5E7EB' }">
                <span class="book-card-placeholder-text">{{ book.title }}</span>
            </div>
        </div>

        <!-- Content -->
        <div class="book-card-content">
            <h3 class="book-card-title">{{ book.title }}</h3>
            <p v-if="book.author" class="book-card-author">{{ book.author }}</p>

            <!-- Status + Rating -->
            <div class="book-card-meta">
                <span v-if="book.status" class="book-card-status">
                    {{ statusLabels[book.status] }}
                </span>
                <span v-if="book.rating != null" class="book-card-rating">
                    <Icon name="tabler:star-filled" class="w-3 h-3" />
                    {{ book.rating }}
                </span>
            </div>
        </div>

        <!-- Shine overlay -->
        <div class="book-card-shine" :style="shineStyle"></div>
    </NuxtLink>
</template>

<script setup>
const props = defineProps({
    book: {
        type: Object,
        required: true
    }
})

const { getPublicUrl } = useStorage()
const router = useRouter()

const statusLabels = {
    por_leer: 'Por leer',
    leyendo: 'Leyendo',
    leido: 'Leído',
    pausado: 'Pausado',
    abandonado: 'Abandonado',
}

const coverUrl = computed(() => {
    const cover = props.book.book_assets?.find(a => a.kind === 'cover')
    return cover ? getPublicUrl('books', cover.storage_path) : null
})

// 3D effect state
const rotateX = ref(0)
const rotateY = ref(0)
const shineX = ref(50)
const shineY = ref(50)
const isHovering = ref(false)

const cardStyle = computed(() => {
    if (!isHovering.value) {
        return {
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
        }
    }

    return {
        transform: `perspective(1000px) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg) translateZ(10px)`,
    }
})

const shineStyle = computed(() => {
    if (!isHovering.value) {
        return {
            opacity: 0,
        }
    }

    return {
        background: `radial-gradient(circle at ${shineX.value}% ${shineY.value}%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
        opacity: 1,
    }
})

const handleMouseEnter = () => {
    isHovering.value = true
}

const handleMouseMove = (e) => {
    if (!isHovering.value) return

    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Calculate rotation (-10 to 10 degrees)
    const rotateXValue = ((y - centerY) / centerY) * -10
    const rotateYValue = ((x - centerX) / centerX) * 10

    rotateX.value = rotateXValue
    rotateY.value = rotateYValue

    // Calculate shine position
    shineX.value = (x / rect.width) * 100
    shineY.value = (y / rect.height) * 100
}

const handleMouseLeave = () => {
    isHovering.value = false
    rotateX.value = 0
    rotateY.value = 0
}

const navigateToBook = () => {
    router.push(`/books/${props.book.id}`)
}
</script>

<style scoped>
.book-card {
    @apply relative flex flex-col overflow-hidden border border-gray-mid rounded-lg bg-light;
    @apply transition-all duration-300 ease-out;
    @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2;
    will-change: transform;
}

/* Desktop: 3D effect */
@media (min-width: 1024px) {
    .book-card:hover {
        @apply shadow-xl;
    }
}

/* Mobile: simple scale */
@media (max-width: 1023px) {
    .book-card:active {
        @apply scale-[1.02] shadow-lg;
    }
}

.book-card-cover {
    @apply relative w-full aspect-[3/4] overflow-hidden bg-gray-100;
}

.book-card-image {
    @apply w-full h-full object-cover;
}

.book-card-placeholder {
    @apply w-full h-full flex items-center justify-center p-4;
}

.book-card-placeholder-text {
    @apply text-center font-medium text-sm line-clamp-4;
    color: rgba(0, 0, 0, 0.6);
}

.book-card-content {
    @apply flex flex-col gap-2 p-4;
}

.book-card-title {
    @apply text-dark font-medium lg:text-lg line-clamp-2;
}

.book-card-author {
    @apply text-gray-dark font-light text-sm;
}

.book-card-meta {
    @apply flex items-center gap-2 mt-auto;
}

.book-card-status {
    @apply bg-primary/10 text-primary text-xs font-medium rounded-full px-2 py-0.5;
}

.book-card-rating {
    @apply flex items-center gap-1 text-primary text-xs font-medium;
}

.book-card-shine {
    @apply absolute inset-0 pointer-events-none transition-opacity duration-300;
    opacity: 0;
}
</style>
