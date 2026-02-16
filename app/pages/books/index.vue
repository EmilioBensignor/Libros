<template>
    <DefaultSection>
        <HeadingH1>Libros</HeadingH1>

        <ButtonPrimary :to="ROUTE_NAMES.BOOKS_NEW">Nuevo libro</ButtonPrimary>

        <div v-if="loading" class="py-12 text-center text-gray-dark">
            <Icon name="tabler:loader-2" class="w-8 h-8 animate-spin" />
        </div>

        <TableLayout
            v-else
            :data="books"
            :columns="columns"
            :show-actions="false"
            empty-state-text="No hay libros registrados"
            table-name="libros"
            @edit="goToEdit"
        >
            <template #cell-title="{ item }">
                <NuxtLink :to="`/books/${item.id}`" class="text-dark underline">
                    {{ item.title || '-' }}
                </NuxtLink>
            </template>

            <template #cell-year="{ value }">
                <span>{{ value != null ? value : '-' }}</span>
            </template>

            <template #cell-status="{ value }">
                <span>{{ statusLabels[value] || value || '-' }}</span>
            </template>

            <template #cell-rating="{ value }">
                <span>{{ value != null ? value : '-' }}</span>
            </template>
        </TableLayout>
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'

const client = useSupabaseClient()
const router = useRouter()
const { error: notifyError } = useNotification()

const books = ref([])
const loading = ref(true)

const columns = [
    { key: 'title', label: 'Título', type: 'text' },
    { key: 'author', label: 'Autor', type: 'text' },
    { key: 'year', label: 'Año', type: 'number' },
    { key: 'status', label: 'Estado', type: 'text' },
    { key: 'rating', label: 'Rating', type: 'number' },
]

const statusLabels = {
    por_leer: 'Por leer',
    leyendo: 'Leyendo',
    leido: 'Leido',
    pausado: 'Pausado',
    abandonado: 'Abandonado',
}

const goToEdit = (item) => {
    router.push(`/books/${item.id}/edit`)
}

const fetchBooks = async () => {
    loading.value = true

    const { data, error } = await client
        .from('books')
        .select('id, title, author, year, status, rating')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })

    if (error) {
        notifyError(handleSupabaseError(error))
    } else {
        books.value = data
    }

    loading.value = false
}

await fetchBooks()
</script>
