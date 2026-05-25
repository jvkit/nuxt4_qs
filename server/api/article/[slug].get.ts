import { readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const path = join(process.cwd(), 'public', 'content', 'articles', `${slug}.json`)
  try {
    const content = await readFile(path, 'utf-8')
    return JSON.parse(content)
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  }
})
