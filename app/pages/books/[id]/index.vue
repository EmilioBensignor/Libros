<template>
    <DefaultSection>
        <div v-if="loading" class="py-12 text-center text-gray-dark">
            <Icon name="tabler:loader-2" class="w-8 h-8 animate-spin" />
        </div>

        <template v-else-if="book">
            <div class="w-full flex">
                <NuxtLink :to="ROUTE_NAMES.HOME"
                    class="flex items-center gap-2 text-dark hover:text-primary transition-colors">
                    <Icon name="tabler:arrow-left" class="w-6 h-6" />
                    <span class="font-light">Volver</span>
                </NuxtLink>
            </div>

            <div class="w-full flex flex-col lg:flex-row gap-6">
                <img v-if="coverUrl" :src="coverUrl" alt="Portada"
                    class="w-full max-w-80 mx-auto lg:mx-0 lg:w-80 h-auto rounded-lg border border-gray-mid shadow-sm shrink-0" />

                <div class="flex-1 flex flex-col gap-4">
                    <HeadingH1>{{ book.title }}</HeadingH1>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div v-if="book.status" class="flex flex-col gap-1">
                            <span class="text-gray-dark text-sm font-medium">Estado</span>
                            <span class="bg-primary/10 text-primary text-sm font-medium rounded-full px-3 py-1 w-fit">
                                {{ statusLabels[book.status] }}
                            </span>
                        </div>

                        <div v-if="book.rating != null" class="flex flex-col gap-1">
                            <span class="text-gray-dark text-sm font-medium">Calificación</span>
                            <span class="flex items-center gap-1 text-dark font-light lg:text-xl">
                                <Icon name="tabler:star-filled" class="w-5 h-5 text-primary" />
                                {{ book.rating }}/10
                            </span>
                        </div>

                        <div v-if="book.color_representativo?.hex" class="flex flex-col gap-1">
                            <span class="text-gray-dark text-sm font-medium">Color</span>
                            <span class="flex items-center gap-2 text-dark font-light lg:text-xl">
                                <span class="w-6 h-6 rounded-full border-2 border-gray-dark"
                                    :style="{ backgroundColor: book.color_representativo.hex }"></span>
                                {{ book.color_representativo.hex }}
                            </span>
                        </div>

                        <div v-if="book.author" class="flex flex-col gap-1">
                            <span class="text-gray-dark text-sm font-medium">Autor</span>
                            <span class="text-dark font-light lg:text-xl">{{ book.author }}</span>
                        </div>

                        <div v-if="book.year" class="flex flex-col gap-1">
                            <span class="text-gray-dark text-sm font-medium">Año de lectura</span>
                            <span class="text-dark font-light lg:text-xl">{{ book.year }}</span>
                        </div>

                        <div v-if="book.topic" class="flex flex-col gap-1">
                            <span class="text-gray-dark text-sm font-medium">Tema</span>
                            <span class="text-dark font-light lg:text-xl">{{ book.topic }}</span>
                        </div>

                        <div v-if="book.keywords?.length" class="sm:col-span-2 flex flex-col gap-2">
                            <span class="text-dark font-medium lg:text-xl">Keywords</span>
                            <div class="flex flex-wrap gap-2">
                                <span v-for="keyword in book.keywords" :key="keyword"
                                    class="bg-gray-light text-dark text-sm font-light rounded-full px-3 py-1">
                                    {{ keyword }}
                                </span>
                            </div>
                        </div>

                        <div v-if="book.takeaways?.length" class="sm:col-span-2 flex flex-col gap-2">
                            <span class="text-dark font-medium lg:text-xl">Takeaways</span>
                            <div class="flex flex-wrap gap-2">
                                <span v-for="takeaway in book.takeaways" :key="takeaway"
                                    class="bg-gray-light text-dark text-sm font-light rounded-full px-3 py-1">
                                    {{ takeaway }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="book.summary || book.opinion" class="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div v-if="book.summary" class="flex flex-col gap-2">
                    <HeadingH2>Resumen</HeadingH2>
                    <p class="text-dark font-light lg:text-xl whitespace-pre-wrap">{{ book.summary }}</p>
                </div>

                <div v-if="book.opinion" class="flex flex-col gap-2">
                    <HeadingH2>Opinión</HeadingH2>
                    <p class="text-dark font-light lg:text-xl whitespace-pre-wrap">{{ book.opinion }}</p>
                </div>
            </div>

            <div v-if="book.book_links?.length" class="w-full flex flex-col gap-2">
                <HeadingH2>Links</HeadingH2>
                <div class="flex gap-3 overflow-x-auto pb-2">
                    <a v-for="link in book.book_links" :key="link.id" :href="link.url" target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-center gap-3 border border-gray-mid rounded-lg p-3 hover:shadow-sm transition-shadow duration-300 shrink-0 min-w-[250px]">
                        <Icon :name="linkIcon(link.kind)" class="w-5 h-5 text-primary shrink-0" />
                        <div class="flex flex-col">
                            <span class="text-dark font-medium">{{ link.title || link.url }}</span>
                            <span class="text-gray-dark text-sm font-light">{{ linkKindLabel(link.kind) }}</span>
                        </div>
                    </a>
                </div>
            </div>

            <div v-if="hasNotas" class="w-full flex flex-col gap-2">
                <HeadingH2>Notas</HeadingH2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div v-for="[key, value] in Object.entries(book.notas_rich)" :key="key"
                        class="flex flex-col gap-2 border border-gray-mid rounded-lg p-4">
                        <span class="text-dark font-medium lg:text-xl">{{ key }}</span>
                        <p class="text-dark font-light whitespace-pre-wrap">{{ value }}</p>
                    </div>
                </div>
            </div>

            <div v-if="boardImages.length" class="w-full flex flex-col gap-2">
                <HeadingH2>Board</HeadingH2>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    <div v-for="img in boardImages" :key="img.id" class="relative aspect-square cursor-pointer"
                        @click="openImageModal(getPublicUrl('books', img.storage_path))">
                        <img :src="getPublicUrl('books', img.storage_path)" alt="Board image"
                            class="w-full h-full object-cover rounded-lg border border-gray-mid hover:opacity-90 transition-opacity" />
                    </div>
                </div>
            </div>

            <div class="w-full flex flex-wrap justify-center items-center gap-3 pt-4">
                <ButtonPrimary :to="`/books/${book.id}/edit`">Editar</ButtonPrimary>
                <button type="button" @click="showDeleteModal = true"
                    class="h-12 flex justify-center items-center bg-error border border-error rounded-[0.625rem] shadow-md shadow-black/20 text-light lg:text-xl font-medium transition duration-300 cursor-pointer py-3 px-12">
                    <span v-if="!deleting">Eliminar</span>
                    <span v-else class="flex items-center gap-2">
                        <Icon name="tabler:loader-2" class="animate-spin" />
                        Eliminando...
                    </span>
                </button>
            </div>

            <div class="w-full flex items-center gap-4 text-sm text-gray-dark font-light">
                <span v-if="book.created_at">Creado: {{ formatDate(book.created_at) }}</span>
                <span v-if="book.updated_at">Actualizado: {{ formatDate(book.updated_at) }}</span>
            </div>

            <ModalDelete :is-open="showDeleteModal" :item-name="book.title" table-name="libros"
                @cancel="showDeleteModal = false" @confirm="handleDelete" />

            <ModalImageViewer :is-open="showImageModal" :image-url="selectedImageUrl" @close="closeImageModal" />
        </template>

        <template v-else>
            <div class="py-12 flex flex-col items-center gap-4">
                <Icon name="tabler:book-off" class="w-12 h-12 text-gray-dark" />
                <p class="text-dark font-light lg:text-xl">Libro no encontrado</p>
                <ButtonPrimary :to="ROUTE_NAMES.HOME">Volver a libros</ButtonPrimary>
            </div>
        </template>
    </DefaultSection>
</template>

<script setup>
import { onMounted } from 'vue'
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'

const route = useRoute()
const client = useSupabaseClient()
const router = useRouter()
const { success: notifySuccess, error: notifyError } = useNotification()
const { getPublicUrl } = useStorage()

const book = ref(null)
const loading = ref(true)
const showDeleteModal = ref(false)
const deleting = ref(false)
const showImageModal = ref(false)
const selectedImageUrl = ref('')

const statusLabels = {
    por_leer: 'Por leer',
    leyendo: 'Leyendo',
    leido: 'Leído',
    pausado: 'Pausado',
    abandonado: 'Abandonado',
}

const coverUrl = computed(() => {
    const cover = book.value?.book_assets?.find(a => a.kind === 'cover')
    return cover ? getPublicUrl('books', cover.storage_path) : null
})

const boardImages = computed(() => {
    return book.value?.book_assets?.filter(a => a.kind === 'board_image') || []
})

const hasNotas = computed(() => {
    return book.value?.notas_rich && typeof book.value.notas_rich === 'object' && Object.keys(book.value.notas_rich).length > 0
})

const linkIcon = (kind) => {
    const icons = {
        article: 'tabler:article',
        video: 'tabler:video',
        podcast: 'tabler:microphone',
        website: 'tabler:world',
        other: 'tabler:link',
    }
    return icons[kind] || 'tabler:link'
}

const linkKindLabel = (kind) => {
    const labels = {
        article: 'Artículo',
        video: 'Video',
        podcast: 'Podcast',
        website: 'Sitio web',
        other: 'Otro',
    }
    return labels[kind] || kind
}

const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return dateStr.split('T')[0].split('-').reverse().join('/')
}

const fetchBook = async () => {
    loading.value = true

    const { data, error } = await client
        .from('books')
        .select('*, book_links(*), book_assets(*)')
        .eq('id', route.params.id)
        .is('deleted_at', null)
        .single()

    if (error) {
        if (error.code !== 'PGRST116') {
            notifyError(handleSupabaseError(error))
        }
        book.value = null
    } else {
        book.value = data
    }

    loading.value = false
}

const handleDelete = async () => {
    showDeleteModal.value = false
    deleting.value = true

    const { error } = await client
        .from('books')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', route.params.id)
        .is('deleted_at', null)

    if (error) {
        notifyError(handleSupabaseError(error))
    } else {
        notifySuccess('Libro eliminado correctamente')
        router.push(ROUTE_NAMES.HOME)
    }

    deleting.value = false
}

const openImageModal = (imageUrl) => {
    selectedImageUrl.value = imageUrl
    showImageModal.value = true
}

const closeImageModal = () => {
    showImageModal.value = false
    selectedImageUrl.value = ''
}

onMounted(() => {
    fetchBook()
})
</script>
