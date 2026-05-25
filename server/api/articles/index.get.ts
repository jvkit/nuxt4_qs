import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async () => {
  const dir = join(process.cwd(), 'public', 'content', 'articles')
  const files = await readdir(dir).catch(() => [] as string[])
  const articles = []
  for (const f of files) {
    if (!f.endsWith('.json')) continue
    const content = await readFile(join(dir, f), 'utf-8')
    articles.push(JSON.parse(content))
  }
  articles.sort((a, b) => a.id - b.id)
  return articles
})
