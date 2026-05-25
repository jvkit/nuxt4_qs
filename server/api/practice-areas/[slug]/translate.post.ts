const BACKEND_URL = 'http://localhost:8002'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  return await $fetch(`${BACKEND_URL}/api/practice-areas/${encodeURIComponent(slug!)}/translate`, {
    method: 'POST',
  })
})
