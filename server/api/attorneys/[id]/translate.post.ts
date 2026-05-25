const BACKEND_URL = 'http://localhost:8002'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  return await $fetch(`${BACKEND_URL}/api/attorneys/${id}/translate`, {
    method: 'POST',
  })
})
