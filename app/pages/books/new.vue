<template>
    <DefaultSection>
        <HeadingH1>Nuevo libro</HeadingH1>
        <BooksForm @saved="onSaved" />
    </DefaultSection>
</template>

<script setup>
const router = useRouter()
const { success: notifySuccess } = useNotification()

const onSaved = (bookId) => {
    notifySuccess('Libro creado correctamente')
    router.push(`/books/${bookId}`)
}
</script>
