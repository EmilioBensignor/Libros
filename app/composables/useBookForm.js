export function useBookForm() {
  const open = useState('book-form:open', () => false)
  const editing = useState('book-form:book', () => null)

  function openForm(book = null) {
    editing.value = book
    open.value = true
  }

  return { open, editing, openForm }
}
