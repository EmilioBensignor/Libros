const PUBLIC_ROUTES = ['/login', '/confirm']

export default defineNuxtRouteMiddleware(async (to) => {
  if (!import.meta.client) return
  if (PUBLIC_ROUTES.includes(to.path)) return

  const user = useSupabaseUser()
  if (user.value) return

  const client = useSupabaseClient()
  const { data } = await client.auth.getSession()
  if (data?.session) return

  return navigateTo('/login')
})
