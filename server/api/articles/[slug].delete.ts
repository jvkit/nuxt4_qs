import { unlink } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
  }

  const path = join(process.cwd(), 'public', 'content', 'articles', `${slug}.json`)
  try {
    await unlink(path)
    return { success: true }
  } catch {
    // 文件不存在也返回成功（幂等删除）
    return { success: true }
  }
})
