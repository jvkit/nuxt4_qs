import { readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const dir = join(process.cwd(), 'public', 'content', 'attorneys')
  try {
    const files = await readFile(join(dir, `attorney-${id}.json`), 'utf-8')
    return JSON.parse(files)
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Attorney not found' })
  }
})
