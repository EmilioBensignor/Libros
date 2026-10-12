const LIST_COLUMNS = 'id, title, author, status, topic, cover_url, rating, pages, published_year, finished_at, sort_order, podium, podium_all, summary, takeaways, keywords, height_cm, spine_color, opinion'

export function useBooks() {
  const supabase = useSupabaseClient()
  const books = useState('books:all', () => [])
  const current = useState('books:current', () => null)
  const loading = ref(false)
  const error = ref(null)

  async function load() {
    loading.value = !books.value.length
    error.value = null
    const { data, error: err } = await supabase
      .from('books')
      .select(LIST_COLUMNS)
      .order('finished_at', { ascending: false, nullsFirst: false })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (err) error.value = err.message
    else books.value = data || []
    loading.value = false
  }

  async function get(id) {
    const { data, error: err } = await supabase.from('books').select('*').eq('id', id).maybeSingle()
    if (err) throw err
    current.value = data
    return data
  }

  async function save(book) {
    const { id, ...fields } = book
    const query = id
      ? supabase.from('books').update(fields).eq('id', id)
      : supabase.from('books').insert(fields)
    const { data, error: err } = await query.select('*').single()
    if (err) throw err
    const index = books.value.findIndex(b => b.id === data.id)
    if (index === -1) books.value = [data, ...books.value]
    else books.value[index] = data
    if (current.value?.id === data.id) current.value = data
    return data
  }

  async function setPodium(book, place, field = 'podium') {
    const year = book.finished_at?.slice(0, 4)
    const sameScope = b => field === 'podium_all' || b.finished_at?.slice(0, 4) === year
    if (place) {
      const holder = books.value.find(b => b.id !== book.id && b[field] === place && sameScope(b))
      if (holder) await save({ id: holder.id, [field]: null })
    }
    return save({ id: book.id, [field]: place })
  }

  async function remove(id) {
    const { error: err } = await supabase.from('books').delete().eq('id', id)
    if (err) throw err
    books.value = books.value.filter(b => b.id !== id)
  }

  return { books, current, loading, error, load, get, save, setPodium, remove }
}
