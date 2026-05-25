const BACKEND_URL = 'http://localhost:8002'

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  if (!form) {
    throw createError({ statusCode: 400, statusMessage: 'No file received' })
  }
  const file = form.find((f) => f.name === 'file')
  if (!file || !file.filename) {
    throw createError({ statusCode: 400, statusMessage: 'Missing file' })
  }

  // 转发到 backend
  const backendForm = new FormData()
  const blob = new Blob([file.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  backendForm.append('file', blob, file.filename)

  return await $fetch(`${BACKEND_URL}/api/upload/article`, {
    method: 'POST',
    body: backendForm,
  })
})
