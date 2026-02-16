<template>
    <DefaultSection>
        <HeadingH1>Biblioteca</HeadingH1>

        <div class="w-full max-w-2xl relative">
            <Icon name="tabler:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-dark" />
            <input v-model="search" type="text"
                placeholder="Buscar por título, autor, keyword, takeaway o notas"
                class="w-full bg-light border border-dark rounded-[5px] outline-none lg:text-xl font-light lg:placeholder:text-xl placeholder:font-light placeholder:text-gray-dark py-3 pl-12 pr-4" />
        </div>

        <div class="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormSelectField v-model="topicFilter" label="Tema" placeholder="Todos"
                :options="topicOptions" :clearable="true" />

            <FormSelectField v-model="yearFilter" label="Año" placeholder="Todos"
                :options="yearOptions" :clearable="true" />

            <FormSelectField v-model="statusFilter" label="Estado" placeholder="Todos"
                :options="statusOptions" :clearable="true" />

            <FormSelectField v-model="ratingFilter" label="Calificación" placeholder="Todas"
                :options="ratingOptions" :clearable="true" />
        </div>

        <div v-if="loading" class="py-12 text-center text-gray-dark">
            <Icon name="tabler:loader-2" class="w-8 h-8 animate-spin" />
        </div>

        <template v-else>
            <div v-if="filteredBooks.length" class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <BooksCard v-for="book in filteredBooks" :key="book.id" :book="book" />
            </div>

            <div v-else class="py-12 text-center">
                <p v-if="search || topicFilter || yearFilter || statusFilter || ratingFilter" class="text-gray-dark font-light lg:text-xl">
                    No se encontraron libros con los criterios seleccionados
                </p>
                <p v-else class="text-gray-dark font-light lg:text-xl">
                    No hay libros en la biblioteca
                </p>
            </div>
        </template>
    </DefaultSection>
</template>

<script setup>
import { onMounted } from 'vue'

const client = useSupabaseClient()
const { error: notifyError } = useNotification()

const books = ref([])
const loading = ref(true)
const search = ref('')

const topicFilter = ref(null)
const yearFilter = ref(null)
const statusFilter = ref(null)
const ratingFilter = ref(null)

const topicOptions = computed(() => {
    const topics = books.value
        .map(b => b.topic)
        .filter(t => t != null && t.trim() !== '')
    const uniqueTopics = [...new Set(topics)].sort()
    return uniqueTopics.map(t => ({ value: t, label: t }))
})

const yearOptions = computed(() => {
    const years = books.value
        .map(b => b.year)
        .filter(y => y != null)
    const uniqueYears = [...new Set(years)].sort((a, b) => b - a)
    return uniqueYears.map(y => ({ value: y, label: y.toString() }))
})

const statusOptions = computed(() => {
    const statuses = books.value
        .map(b => b.status)
        .filter(s => s != null)
    const uniqueStatuses = [...new Set(statuses)]
    const statusLabels = {
        por_leer: 'Por leer',
        leyendo: 'Leyendo',
        leido: 'Leído',
        pausado: 'Pausado',
        abandonado: 'Abandonado',
    }
    return uniqueStatuses.map(s => ({ value: s, label: statusLabels[s] }))
})

const ratingOptions = computed(() => {
    const ratings = books.value
        .map(b => b.rating)
        .filter(r => r != null)
    const uniqueRatings = [...new Set(ratings)].sort((a, b) => b - a)
    return uniqueRatings.map(r => ({ value: r, label: r.toString() }))
})

const filteredBooks = computed(() => {
    let result = books.value

    if (topicFilter.value != null) {
        result = result.filter(b => b.topic === topicFilter.value)
    }

    if (yearFilter.value != null) {
        result = result.filter(b => b.year === yearFilter.value)
    }

    if (statusFilter.value != null) {
        result = result.filter(b => b.status === statusFilter.value)
    }

    if (ratingFilter.value != null) {
        result = result.filter(b => b.rating === ratingFilter.value)
    }

    if (!search.value.trim()) return result

    const query = search.value.toLowerCase().trim()

    return result.filter(book => {
        if (book.title?.toLowerCase().includes(query)) return true
        if (book.author?.toLowerCase().includes(query)) return true
        if (book.keywords?.some(k => k.toLowerCase().includes(query))) return true
        if (book.takeaways?.some(t => t.toLowerCase().includes(query))) return true

        if (book.notas_rich && typeof book.notas_rich === 'object') {
            const notasValues = Object.values(book.notas_rich)
            if (notasValues.some(v =>
                typeof v === 'string' && v.toLowerCase().includes(query)
            )) return true
        }

        return false
    })
})

const fetchBooks = async () => {
    loading.value = true

    const { data, error } = await client
        .from('books')
        .select('id, title, author, status, rating, updated_at, keywords, takeaways, topic, year, notas_rich, color_representativo, book_assets(id, kind, storage_path)')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })

    if (error) {
        notifyError(handleSupabaseError(error))
    } else {
        books.value = data
    }

    loading.value = false
}

onMounted(() => {
    fetchBooks()
})
</script>
