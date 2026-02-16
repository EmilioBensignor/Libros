<template>
    <DefaultSection>
        <div class="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <HeadingH1>Papelera</HeadingH1>
            <NuxtLink :to="ROUTE_NAMES.BOOKS" class="text-dark font-light underline">Volver a libros</NuxtLink>
        </div>

        <div v-if="loading" class="py-12 text-center text-gray-dark">
            <Icon name="tabler:loader-2" class="w-8 h-8 animate-spin" />
        </div>

        <TableLayout v-else :data="books" :columns="columns" :show-actions="false"
            empty-state-text="La papelera está vacía" table-name="libros">
            <template #cell-status="{ value }">
                <span>{{ statusLabels[value] || value || '-' }}</span>
            </template>

            <template #cell-rating="{ value }">
                <span>{{ value != null ? value : '-' }}</span>
            </template>

            <template #cell-actions="{ item }">
                <div class="flex justify-center items-center gap-2">
                    <button type="button" @click="handleRestore(item)" title="Restaurar"
                        :disabled="restoring === item.id">
                        <Icon v-if="restoring !== item.id" name="tabler:restore" class="w-6 h-6 text-primary" />
                        <Icon v-else name="tabler:loader-2" class="w-6 h-6 text-primary animate-spin" />
                    </button>
                    <button type="button" @click="openDeleteModal(item)" title="Eliminar permanentemente">
                        <Icon name="tabler:trash-x" class="w-6 h-6 text-error" />
                    </button>
                </div>
            </template>
        </TableLayout>

        <ModalDelete :is-open="deleteModal.isOpen" :item-name="deleteModal.itemName" table-name="libros"
            @cancel="closeDeleteModal" @confirm="handleHardDelete" />
    </DefaultSection>
</template>

<script setup>
import { onMounted } from 'vue'
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'

const client = useSupabaseClient()
const { success: notifySuccess, error: notifyError } = useNotification()
const { removeFile } = useStorage()

const books = ref([])
const loading = ref(true)
const restoring = ref(null)

const columns = [
    { key: 'title', label: 'Título', type: 'text' },
    { key: 'author', label: 'Autor', type: 'text' },
    { key: 'status', label: 'Estado', type: 'text' },
    { key: 'rating', label: 'Rating', type: 'number' },
    { key: 'updated_at', label: 'Eliminado', type: 'date' },
    { key: 'actions', label: 'Acciones', type: 'text' },
]

const statusLabels = {
    por_leer: 'Por leer',
    leyendo: 'Leyendo',
    leido: 'Leído',
    pausado: 'Pausado',
    abandonado: 'Abandonado',
}

const deleteModal = ref({
    isOpen: false,
    item: null,
    itemName: '',
})

const fetchBooks = async () => {
    loading.value = true

    const { data, error } = await client
        .from('books')
        .select('id, title, author, status, rating, updated_at')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false })

    if (error) {
        notifyError(handleSupabaseError(error))
    } else {
        books.value = data
    }

    loading.value = false
}

const handleRestore = async (item) => {
    restoring.value = item.id

    const { error } = await client
        .from('books')
        .update({ deleted_at: null })
        .eq('id', item.id)

    if (error) {
        notifyError(handleSupabaseError(error))
    } else {
        notifySuccess(`"${item.title}" restaurado correctamente`)
        books.value = books.value.filter(b => b.id !== item.id)
    }

    restoring.value = null
}

const openDeleteModal = (item) => {
    deleteModal.value = {
        isOpen: true,
        item,
        itemName: item.title || `ID: ${item.id}`,
    }
}

const closeDeleteModal = () => {
    deleteModal.value.isOpen = false
}

const handleHardDelete = async () => {
    const item = deleteModal.value.item
    deleteModal.value.isOpen = false

    // 1. Obtener todos los book_assets asociados
    const { data: assets, error: assetsError } = await client
        .from('book_assets')
        .select('storage_path')
        .eq('book_id', item.id)

    if (assetsError) {
        notifyError(handleSupabaseError(assetsError))
        return
    }

    // 2. Eliminar cada archivo del bucket
    if (assets && assets.length > 0) {
        try {
            for (const asset of assets) {
                await removeFile('books', asset.storage_path)
            }
        } catch (storageError) {
            notifyError('Error al eliminar archivos del storage')
            console.error(storageError)
            return
        }
    }

    // 3. Eliminar el registro del libro (esto también eliminará book_assets por CASCADE)
    const { error } = await client
        .from('books')
        .delete()
        .eq('id', item.id)

    if (error) {
        notifyError(handleSupabaseError(error))
    } else {
        notifySuccess(`"${item.title}" eliminado permanentemente`)
        books.value = books.value.filter(b => b.id !== item.id)
    }
}

onMounted(() => {
    fetchBooks()
})
</script>
