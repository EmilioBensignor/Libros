export const useStorage = () => {
    const supabase = useSupabaseClient()
    const config = useRuntimeConfig()

    const uploading = ref(false)
    const uploadProgress = ref(0)
    const error = ref(null)

    const validateImageFile = (file) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
        const maxSize = 10 * 1024 * 1024

        if (!file || !file.type) {
            throw new Error('Archivo inválido o sin tipo')
        }

        if (!allowedTypes.includes(file.type)) {
            throw new Error('Tipo de archivo no permitido. Solo se permiten: JPEG, PNG, WebP, GIF, SVG')
        }

        if (file.size > maxSize) {
            throw new Error('El archivo es demasiado grande. Máximo 10MB')
        }

        return true
    }

    return {
        uploading: readonly(uploading),
        uploadProgress: readonly(uploadProgress),
        error: readonly(error),
        validateImageFile
    }
}
