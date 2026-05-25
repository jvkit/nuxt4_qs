import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async () => {
  const dir = join(process.cwd(), 'public', 'content', 'practice-areas')
  const files = await readdir(dir).catch(() => [] as string[])
  const areas = []
  for (const f of files) {
    if (!f.endsWith('.json')) continue
    const content = await readFile(join(dir, f), 'utf-8')
    areas.push(JSON.parse(content))
  }
  return areas
})
