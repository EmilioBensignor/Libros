<template>
    <DefaultSection>
        <div v-if="loading" class="py-12 text-center text-gray-dark">
            <Icon name="tabler:loader-2" class="w-8 h-8 animate-spin" />
        </div>

        <template v-else-if="notFound">
            <div class="py-12 flex flex-col items-center gap-4">
                <Icon name="tabler:book-off" class="w-12 h-12 text-gray-dark" />
                <p class="text-dark font-light lg:text-xl">Libro no encontrado</p>
                <ButtonPrimary :to="ROUTE_NAMES.HOME">Volver a libros</ButtonPrimary>
            </div>
        </template>

        <template v-else>
            <HeadingH1>Editar libro</HeadingH1>
            <BooksForm :book-id="route.params.id" :initial-data="bookData" @saved="onSaved" />
        </template>
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'

const route = useRoute()
const router = useRouter()
const client = useSupabaseClient()
const { success: notifySuccess, error: notifyError } = useNotification()

const loading = ref(true)
const notFound = ref(false)
const bookData = ref(null)

const fetchBook = async () => {
    loading.value = true

    const { data, error } = await client
        .from('books')
        .select('*, book_links(*), book_assets(*)')
        .eq('id', route.params.id)
        .is('deleted_at', null)
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            notFound.value = true
        } else {
            notifyError(handleSupabaseError(error))
            notFound.value = true
        }
    } else {
        bookData.value = data
    }

    loading.value = false
}

const onSaved = (bookId) => {
    notifySuccess('Libro actualizado correctamente')
    router.push(`/books/${bookId}`)
}

await fetchBook()
</script>
