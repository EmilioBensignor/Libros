<template>
    <FormLayout @submit.prevent="handleSubmit">

        <FormFieldsContainer>
            <FormTextField v-model="form.title" label="Título" id="title" placeholder="Start With Why"
                :error="errors.title" required @blur="validateTitle" />
            <FormTextField v-model="form.author" label="Autor" id="author"
                placeholder="Simon Sinek" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="form.year" label="Año" id="year" type="number" placeholder="Año de lectura"
                :error="errors.year" @blur="validateYear" />
            <FormTextField v-model="form.topic" label="Tema" id="topic" placeholder="Liderazgo" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormSelectField v-model="form.status" label="Estado" :options="statusOptions" />
            <FormTextField v-model="form.rating" label="Rating (1-10)" id="rating" type="number"
                placeholder="1-10" :error="errors.rating" @blur="validateRating" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextareaField v-model="form.summary" label="Resumen" id="summary"
                placeholder="Breve resumen del libro" />
            <FormTextareaField v-model="form.opinion" label="Opinión personal" id="opinion"
                placeholder="Tu opinión sobre el libro" />
        </FormFieldsContainer>

        <div class="w-full flex flex-col gap-3">
            <FormLabel>Keywords</FormLabel>
            <div class="flex items-center gap-2">
                <input v-model="newKeyword" type="text" placeholder="Agregar keyword"
                    class="flex-1 bg-light border border-dark rounded-[5px] outline-none lg:text-xl font-light placeholder:font-light placeholder:text-gray-dark py-3 px-[0.875rem]"
                    @keydown.enter.prevent="addKeyword" />
                <ButtonPrimary type="button" @click="addKeyword">Agregar</ButtonPrimary>
            </div>
            <div v-if="form.keywords.length" class="flex flex-wrap items-center gap-2">
                <span v-for="(kw, i) in form.keywords" :key="i"
                    class="flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium rounded-full px-3 py-1.5">
                    {{ kw }}
                    <button type="button" @click="form.keywords.splice(i, 1)" class="flex items-center justify-center hover:text-error transition-colors">
                        <Icon name="tabler:x" class="w-3.5 h-3.5" />
                    </button>
                </span>
            </div>
        </div>

        <div class="w-full flex flex-col gap-3">
            <FormLabel>Takeaways</FormLabel>
            <div class="flex items-center gap-2">
                <input v-model="newTakeaway" type="text" placeholder="Agregar takeaway"
                    class="flex-1 bg-light border border-dark rounded-[5px] outline-none lg:text-xl font-light placeholder:font-light placeholder:text-gray-dark py-3 px-[0.875rem]"
                    @keydown.enter.prevent="addTakeaway" />
                <ButtonPrimary type="button" @click="addTakeaway">Agregar</ButtonPrimary>
            </div>
            <div v-if="form.takeaways.length" class="flex flex-wrap items-center gap-2">
                <span v-for="(tw, i) in form.takeaways" :key="i"
                    class="flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium rounded-full px-3 py-1.5">
                    {{ tw }}
                    <button type="button" @click="form.takeaways.splice(i, 1)" class="flex items-center justify-center hover:text-error transition-colors">
                        <Icon name="tabler:x" class="w-3.5 h-3.5" />
                    </button>
                </span>
            </div>
        </div>

        <div class="w-full flex flex-col gap-2">
            <FormLabel>Color representativo</FormLabel>
            <div class="flex items-center gap-3">
                <div class="relative">
                    <div
                        class="w-10 h-10 rounded-full border-2 border-dark cursor-pointer transition-transform hover:scale-110"
                        :style="{ backgroundColor: form.colorHex || '#000000' }"
                        @click="$refs.colorInput.click()"
                    ></div>
                    <input
                        ref="colorInput"
                        type="color"
                        :value="form.colorHex || '#000000'"
                        @input="form.colorHex = $event.target.value"
                        class="absolute inset-0 opacity-0 cursor-pointer"
                    />
                </div>
                <input v-model="form.colorHex" type="text" placeholder="#000000" maxlength="7"
                    class="w-28 bg-light border border-dark rounded-[5px] outline-none font-light text-sm py-2 px-3" />
                <button v-if="form.colorHex" type="button" @click="form.colorHex = ''"
                    class="flex items-center justify-center text-error hover:text-error/70 transition-colors">
                    <Icon name="tabler:x" class="w-4 h-4" />
                </button>
            </div>
        </div>

        <div class="w-full flex flex-col gap-3">
            <FormLabel>Notas</FormLabel>
            <div v-for="(nota, i) in form.notas" :key="i"
                class="flex flex-col gap-3 border border-gray-mid rounded-lg p-4 relative">
                <button type="button" @click="form.notas.splice(i, 1)"
                    class="absolute top-2 right-2 text-gray-dark hover:text-error">
                    <Icon name="tabler:x" class="w-5 h-5" />
                </button>
                <FormFieldsContainer>
                    <FormTextField v-model="nota.key" label="Clave" :id="'nota-key-' + i"
                        placeholder="Capítulo 1" />
                    <FormTextField v-model="nota.value" label="Valor" :id="'nota-value-' + i"
                        placeholder="Idea principal" />
                </FormFieldsContainer>
            </div>
            <button type="button" @click="form.notas.push({ key: '', value: '' })"
                class="w-full flex items-center justify-center gap-2 border border-dashed border-gray-dark rounded-lg py-3 text-gray-dark hover:text-primary hover:border-primary transition-colors duration-300">
                <Icon name="tabler:plus" class="w-5 h-5" />
                <span class="font-medium">Agregar nota</span>
            </button>
        </div>

        <div class="w-full flex flex-col gap-3">
            <FormLabel>Links</FormLabel>
            <div v-for="(link, i) in form.links" :key="i"
                class="flex flex-col gap-3 border border-gray-mid rounded-lg p-4 relative">
                <button type="button" @click="form.links.splice(i, 1)"
                    class="absolute top-2 right-2 text-gray-dark hover:text-error">
                    <Icon name="tabler:x" class="w-5 h-5" />
                </button>

                <FormFieldsContainer>
                    <FormTextField v-model="link.title" label="Título" :id="'link-title-' + i"
                        placeholder="Nombre del recurso" />
                    <FormTextField v-model="link.url" label="URL" :id="'link-url-' + i"
                        placeholder="www" :error="linkErrors[i]" />
                </FormFieldsContainer>

                <FormSelectField v-model="link.kind" label="Tipo" :options="linkKindOptions" />
            </div>

            <button type="button" @click="addLink"
                class="w-full flex items-center justify-center gap-2 border border-dashed border-gray-dark rounded-lg py-3 text-gray-dark hover:text-primary hover:border-primary transition-colors duration-300">
                <Icon name="tabler:plus" class="w-5 h-5" />
                <span class="font-medium">Agregar link</span>
            </button>
        </div>

        <div class="w-full flex flex-col gap-3">
            <FormLabel>Portada</FormLabel>
            <div v-if="coverPreview" class="relative w-48">
                <img :src="coverPreview" alt="Portada" class="w-48 h-auto rounded-lg border border-gray-mid" />
                <button type="button" @click="removeCover"
                    class="absolute -top-2 -right-2 bg-error text-light rounded-full w-6 h-6 flex items-center justify-center">
                    <Icon name="tabler:x" class="w-4 h-4" />
                </button>
            </div>
            <label
                class="flex items-center justify-center gap-2 border border-dashed border-gray-dark rounded-lg py-3 cursor-pointer text-gray-dark hover:text-primary hover:border-primary transition-colors duration-300">
                <Icon name="tabler:upload" class="w-5 h-5" />
                <span class="font-medium">{{ coverPreview ? 'Cambiar portada' : 'Subir portada' }}</span>
                <input type="file" accept="image/*" class="hidden" @change="onCoverSelected" />
            </label>
        </div>

        <div class="w-full flex flex-col gap-3">
            <FormLabel>Board de imágenes</FormLabel>
            <div v-if="boardPreviews.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <div v-for="(img, i) in boardPreviews" :key="i" class="relative aspect-square">
                    <img :src="img.url" alt="Board image" class="w-full h-full object-cover rounded-lg border border-gray-mid" />
                    <button type="button" @click="removeBoardImage(i)"
                        class="absolute -top-2 -right-2 bg-error text-light rounded-full w-6 h-6 flex items-center justify-center">
                        <Icon name="tabler:x" class="w-4 h-4" />
                    </button>
                </div>
            </div>
            <label
                class="flex items-center justify-center gap-2 border border-dashed border-gray-dark rounded-lg py-3 cursor-pointer text-gray-dark hover:text-primary hover:border-primary transition-colors duration-300">
                <Icon name="tabler:upload" class="w-5 h-5" />
                <span class="font-medium">Agregar imágenes</span>
                <input type="file" accept="image/*" multiple class="hidden" @change="onBoardImagesSelected" />
            </label>
        </div>

        <FormError v-if="errorMsg">{{ errorMsg }}</FormError>

        <div class="flex flex-col sm:flex-row gap-4">
            <ButtonSecondary :to="cancelRoute" class="order-2 sm:order-1">
                Cancelar
            </ButtonSecondary>

            <ButtonPrimary type="submit" class="order-1 sm:order-2">
                <span v-if="!isLoading">Guardar</span>
                <span v-else class="flex justify-center items-center gap-2">
                    <Icon name="tabler:loader-2" class="animate-spin" />
                    Guardando...
                </span>
            </ButtonPrimary>
        </div>
    </FormLayout>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'

const props = defineProps({
    bookId: { type: String, default: null },
    initialData: { type: Object, default: null },
})

const emit = defineEmits(['saved'])

const client = useSupabaseClient()
const user = useSupabaseUser()
const { uploadFile, removeFile, getPublicUrl } = useStorage()
const { error: notifyError } = useNotification()

const isEditing = computed(() => !!props.bookId)
const cancelRoute = computed(() =>
    isEditing.value ? `/books/${props.bookId}` : ROUTE_NAMES.HOME
)

const form = reactive({
    title: '',
    author: '',
    year: '',
    topic: '',
    status: 'por_leer',
    rating: '',
    summary: '',
    opinion: '',
    keywords: [],
    takeaways: [],
    colorHex: '',
    notas: [],
    links: [],
})

const errors = reactive({
    title: '',
    rating: '',
    year: '',
})
const linkErrors = reactive({})

const isLoading = ref(false)
const errorMsg = ref('')

const newKeyword = ref('')
const newTakeaway = ref('')

const coverFile = ref(null)
const coverPreview = ref(null)
const existingCoverAsset = ref(null)
const coverRemoved = ref(false)

const boardFiles = ref([])
const existingBoardAssets = ref([])
const boardRemovedIds = ref([])

const boardPreviews = computed(() => {
    const existing = existingBoardAssets.value
        .filter(a => !boardRemovedIds.value.includes(a.id))
        .map(a => ({ url: getPublicUrl('books', a.storage_path), assetId: a.id, isExisting: true }))
    const newOnes = boardFiles.value.map((f, i) => ({ url: f.previewUrl, index: i, isExisting: false }))
    return [...existing, ...newOnes]
})

const statusOptions = [
    { value: 'por_leer', label: 'Por leer' },
    { value: 'leyendo', label: 'Leyendo' },
    { value: 'leido', label: 'Leído' },
    { value: 'pausado', label: 'Pausado' },
    { value: 'abandonado', label: 'Abandonado' },
]

const linkKindOptions = [
    { value: 'article', label: 'Artículo' },
    { value: 'video', label: 'Video' },
    { value: 'podcast', label: 'Podcast' },
    { value: 'website', label: 'Sitio web' },
    { value: 'other', label: 'Otro' },
]

const jsonToNotas = (obj) => {
    if (!obj || typeof obj !== 'object') return []
    return Object.entries(obj).map(([key, value]) => ({
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value),
    }))
}

const notasToJson = (notas) => {
    const filtered = notas.filter(n => n.key.trim())
    if (!filtered.length) return null
    const obj = {}
    for (const n of filtered) {
        obj[n.key.trim()] = n.value.trim()
    }
    return obj
}

if (props.initialData) {
    const d = props.initialData
    form.title = d.title || ''
    form.author = d.author || ''
    form.year = d.year != null ? d.year : ''
    form.topic = d.topic || ''
    form.status = d.status || 'por_leer'
    form.rating = d.rating != null ? d.rating : ''
    form.summary = d.summary || ''
    form.opinion = d.opinion || ''
    form.keywords = d.keywords ? [...d.keywords] : []
    form.takeaways = d.takeaways ? [...d.takeaways] : []
    form.colorHex = d.color_representativo?.hex || ''
    form.notas = jsonToNotas(d.notas_rich)

    if (d.book_links?.length) {
        form.links = d.book_links.map(l => ({
            id: l.id,
            title: l.title || '',
            url: l.url,
            kind: l.kind || 'other',
        }))
    }

    if (d.book_assets?.length) {
        const cover = d.book_assets.find(a => a.kind === 'cover')
        if (cover) {
            existingCoverAsset.value = cover
            coverPreview.value = getPublicUrl('books', cover.storage_path)
        }
        existingBoardAssets.value = d.book_assets.filter(a => a.kind === 'board_image')
    }
}

const addKeyword = () => {
    const val = newKeyword.value.trim()
    if (val && !form.keywords.includes(val)) {
        form.keywords.push(val)
    }
    newKeyword.value = ''
}

const addTakeaway = () => {
    const val = newTakeaway.value.trim()
    if (val) {
        form.takeaways.push(val)
    }
    newTakeaway.value = ''
}

const addLink = () => {
    form.links.push({ id: null, title: '', url: '', kind: 'other' })
}

const onCoverSelected = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    coverFile.value = file
    coverPreview.value = URL.createObjectURL(file)
    coverRemoved.value = false
}

const removeCover = () => {
    coverFile.value = null
    coverPreview.value = null
    coverRemoved.value = true
}

const onBoardImagesSelected = (e) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
        boardFiles.value.push({ file, previewUrl: URL.createObjectURL(file) })
    }
    e.target.value = ''
}

const removeBoardImage = (index) => {
    const preview = boardPreviews.value[index]
    if (preview.isExisting) {
        boardRemovedIds.value.push(preview.assetId)
    } else {
        boardFiles.value.splice(preview.index, 1)
    }
}

const validateTitle = () => {
    errors.title = !form.title.trim() ? 'El título es requerido' : ''
}

const validateRating = () => {
    if (form.rating !== '' && form.rating != null) {
        const num = Number(form.rating)
        errors.rating = (isNaN(num) || num < 1 || num > 10 || !Number.isInteger(num))
            ? 'El rating debe ser un número entero entre 1 y 10' : ''
    } else {
        errors.rating = ''
    }
}

const validateYear = () => {
    if (form.year !== '' && form.year != null) {
        const num = Number(form.year)
        errors.year = (isNaN(num) || !Number.isInteger(num) || num < 0 || num > 9999)
            ? 'El año debe ser un número entero válido' : ''
    } else {
        errors.year = ''
    }
}

const validateLinks = () => {
    let valid = true
    form.links.forEach((link, i) => {
        if (link.url && !link.url.startsWith('http://') && !link.url.startsWith('https://')) {
            linkErrors[i] = 'La URL debe empezar con http:// o https://'
            valid = false
        } else {
            delete linkErrors[i]
        }
    })
    return valid
}

watch(() => form.title, () => { if (errors.title) errors.title = '' })
watch(() => form.rating, () => { if (errors.rating) errors.rating = '' })
watch(() => form.year, () => { if (errors.year) errors.year = '' })

const handleSubmit = async () => {
    isLoading.value = true
    errorMsg.value = ''

    validateTitle()
    validateRating()
    validateYear()
    const linksValid = validateLinks()

    if (errors.title || errors.rating || errors.year || !linksValid) {
        isLoading.value = false
        return
    }

    try {
        const { data: { user: currentUser } } = await client.auth.getUser()
        if (!currentUser) throw new Error('No se encontró el usuario autenticado')
        const uid = currentUser.id

        const bookData = {
            title: form.title.trim(),
            author: form.author.trim() || null,
            year: form.year !== '' ? Number(form.year) : null,
            topic: form.topic.trim() || null,
            status: form.status,
            rating: form.rating !== '' ? Number(form.rating) : null,
            summary: form.summary.trim() || null,
            opinion: form.opinion.trim() || null,
            keywords: form.keywords,
            takeaways: form.takeaways,
            color_representativo: form.colorHex ? { hex: form.colorHex } : null,
            notas_rich: notasToJson(form.notas),
            user_id: uid,
        }

        let bookId = props.bookId

        if (isEditing.value) {
            const { error } = await client.from('books').update(bookData).eq('id', bookId)
            if (error) throw error
        } else {
            const { data, error } = await client.from('books').insert(bookData).select('id').single()
            if (error) throw error
            bookId = data.id
        }

        await syncCover(bookId, uid)
        await syncBoardImages(bookId, uid)
        await syncLinks(bookId, uid)

        emit('saved', bookId)
    } catch (err) {
        errorMsg.value = handleSupabaseError(err)
        notifyError(errorMsg.value)
    } finally {
        isLoading.value = false
    }
}

const slugify = (text) => {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

const syncCover = async (bookId, uid) => {
    if ((coverRemoved.value || coverFile.value) && existingCoverAsset.value) {
        await removeFile('books', existingCoverAsset.value.storage_path).catch(() => {})
        await client.from('book_assets').delete().eq('id', existingCoverAsset.value.id)
        existingCoverAsset.value = null
    }

    if (coverFile.value) {
        const ext = coverFile.value.name.split('.').pop()
        const slug = slugify(form.title)
        const path = `${uid}/covers/${slug}.${ext}`
        await uploadFile('books', path, coverFile.value)
        await client.from('book_assets').insert({
            book_id: bookId,
            kind: 'cover',
            storage_path: path,
            source: 'photo',
            sort_order: 0,
            user_id: uid,
        })
    }
}

const syncBoardImages = async (bookId, uid) => {
    for (const assetId of boardRemovedIds.value) {
        const asset = existingBoardAssets.value.find(a => a.id === assetId)
        if (asset) {
            await removeFile('books', asset.storage_path).catch(() => {})
            await client.from('book_assets').delete().eq('id', assetId)
        }
    }

    const slug = slugify(form.title)
    for (let i = 0; i < boardFiles.value.length; i++) {
        const { file } = boardFiles.value[i]
        const ext = file.name.split('.').pop()
        const existing = existingBoardAssets.value.filter(a => !boardRemovedIds.value.includes(a.id))
        const totalIndex = existing.length + i
        const suffix = totalIndex > 0 ? `-${String(totalIndex).padStart(3, '0')}` : ''
        const filename = `${slug}${suffix}.${ext}`
        const path = `${uid}/board/${slug}/${filename}`
        await uploadFile('books', path, file)
        await client.from('book_assets').insert({
            book_id: bookId,
            kind: 'board_image',
            storage_path: path,
            source: 'photo',
            sort_order: i,
            user_id: uid,
        })
    }
}

const syncLinks = async (bookId, uid) => {
    if (isEditing.value) {
        const currentIds = form.links.filter(l => l.id).map(l => l.id)

        if (props.initialData?.book_links?.length) {
            const toDelete = props.initialData.book_links
                .filter(l => !currentIds.includes(l.id))
                .map(l => l.id)
            if (toDelete.length) {
                await client.from('book_links').delete().in('id', toDelete)
            }
        }

        for (const link of form.links.filter(l => l.id)) {
            await client.from('book_links').update({
                title: link.title.trim() || null,
                url: link.url.trim(),
                kind: link.kind,
            }).eq('id', link.id)
        }
    }

    const newLinks = form.links
        .filter(l => !l.id && l.url.trim())
        .map(l => ({
            book_id: bookId,
            title: l.title.trim() || null,
            url: l.url.trim(),
            kind: l.kind,
            user_id: uid,
        }))

    if (newLinks.length) {
        const { error } = await client.from('book_links').insert(newLinks)
        if (error) throw error
    }
}
</script>
