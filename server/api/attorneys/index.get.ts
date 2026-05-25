import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async () => {
  const dir = join(process.cwd(), 'public', 'content', 'attorneys')
  const files = await readdir(dir).catch(() => [] as string[])
  const attorneys = []
  for (const f of files) {
    if (!f.endsWith('.json')) continue
    const content = await readFile(join(dir, f), 'utf-8')
    attorneys.push(JSON.parse(content))
  }
  attorneys.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  return attorneys
})
