import { readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const path = join(process.cwd(), 'public', 'content', 'practice-areas', `${slug}.json`)
  try {
    const content = await readFile(path, 'utf-8')
    return JSON.parse(content)
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Practice area not found' })
  }
})
