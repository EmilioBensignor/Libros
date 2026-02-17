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

    const uploadFile = async (bucket, path, file) => {
        uploading.value = true
        error.value = null

        try {
            validateImageFile(file)

            const { data, error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(path, file, { upsert: true })

            if (uploadError) {
                error.value = uploadError.message
                throw uploadError
            }

            return data.path
        } finally {
            uploading.value = false
        }
    }

    const uploadFileRaw = async (bucket, path, file, { maxSizeMB = 20 } = {}) => {
        uploading.value = true
        error.value = null

        try {
            if (!file || !file.type) {
                throw new Error('Archivo inválido o sin tipo')
            }

            const maxSize = maxSizeMB * 1024 * 1024
            if (file.size > maxSize) {
                throw new Error(`El archivo es demasiado grande. Máximo ${maxSizeMB}MB`)
            }

            const { data, error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(path, file, { upsert: true })

            if (uploadError) {
                error.value = uploadError.message
                throw uploadError
            }

            return data.path
        } finally {
            uploading.value = false
        }
    }

    const removeFile = async (bucket, path) => {
        const { error: removeError } = await supabase.storage
            .from(bucket)
            .remove([path])

        if (removeError) throw removeError
    }

    const getPublicUrl = (bucket, path) => {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path)
        return data.publicUrl
    }

    return {
        uploading: readonly(uploading),
        uploadProgress: readonly(uploadProgress),
        error: readonly(error),
        validateImageFile,
        uploadFile,
        uploadFileRaw,
        removeFile,
        getPublicUrl
    }
}
