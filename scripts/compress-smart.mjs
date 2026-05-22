/**
 * 智能分层压缩图片
 * 根据图片在网页上的实际渲染尺寸决定压缩策略（考虑 2x DPI）
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = path.resolve(__dirname, '../public')

const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

// 策略说明：maxWidth = 实际显示最大宽度的 ~2 倍（覆盖 Retina/高 DPI 屏幕）
const STRATEGIES = {
  // 大屏全屏轮播：不压缩
  'images/home/hero': { skip: true, reason: '全屏轮播大图，保持原样' },

  // 页面顶部 hero 背景：不压缩
  'images/shared/hero': { skip: true, reason: '页面顶部 hero 背景，保持原样' },

  // 律师头像：列表页 180-400px 显示 → 限制 600px（覆盖 2x DPI），多压一点
  'images/attorney/avatars': { maxWidth: 600, quality: 75, reason: '律师头像，显示 180-400px' },

  // 首页优势卡片：3列 ~380px / 单列 ~800px → 限制 800px
  'images/home/advantages': { maxWidth: 800, quality: 80, reason: '优势卡片，显示 380-800px' },

  // 首页服务轮播：active 72%宽度 ~1400px → 限制 1600px（大图少压）
  'images/home/services': { maxWidth: 1600, quality: 85, reason: '服务轮播，显示 ~1400px' },

  // 关于我们：2列布局 ~540px → 限制 1200px
  'images/aboutus': { maxWidth: 1200, quality: 85, reason: '关于我们，显示 ~540px' },

  // 文章封面：卡片中显示 ~380px → 限制 800px
  'images/article/covers': { maxWidth: 800, quality: 80, reason: '文章封面，显示 ~380px' },

  // 律师页其他素材（header 等）
  'images/attorney': { maxWidth: 1920, quality: 85, reason: '律师页素材' },
}

async function processFile(filePath, strategy) {
  const ext = path.extname(filePath).toLowerCase()
  if (!EXTENSIONS.includes(ext)) return null

  if (strategy.skip) {
    console.log(`   ⏭  跳过 ${path.relative(PUBLIC_DIR, filePath)} — ${strategy.reason}`)
    return null
  }

  const originalSize = fs.statSync(filePath).size
  const buffer = fs.readFileSync(filePath)

  let pipeline = sharp(buffer)
  const metadata = await pipeline.metadata()

  const shouldResize = metadata.width && metadata.width > strategy.maxWidth
  if (shouldResize) {
    pipeline = pipeline.resize(strategy.maxWidth, undefined, { withoutEnlargement: true })
  }

  let outputBuffer
  if (ext === '.png') {
    outputBuffer = await pipeline.png({ quality: strategy.quality, compressionLevel: 9 }).toBuffer()
  } else {
    outputBuffer = await pipeline.jpeg({ quality: strategy.quality, progressive: true, mozjpeg: true }).toBuffer()
  }

  fs.writeFileSync(filePath, outputBuffer)

  const newSize = outputBuffer.length
  const saved = ((originalSize - newSize) / originalSize * 100).toFixed(1)
  const dim = shouldResize
    ? `${metadata.width}x${metadata.height}→${strategy.maxWidth}w`
    : `${metadata.width}x${metadata.height}`
  console.log(`   ✓ ${path.relative(PUBLIC_DIR, filePath)} (${dim}): ${(originalSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB (-${saved}%)`)

  return { originalSize, newSize }
}

async function walk(dir, strategy, stats) {
  const relDir = path.relative(PUBLIC_DIR, dir).replace(/\\/g, '/')
  let currentStrategy = strategy
  for (const [pattern, s] of Object.entries(STRATEGIES)) {
    if (relDir === pattern || relDir.startsWith(pattern + '/')) {
      currentStrategy = s
      break
    }
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(fullPath, currentStrategy, stats)
    } else {
      const result = await processFile(fullPath, currentStrategy)
      if (result) {
        stats.totalOriginal += result.originalSize
        stats.totalNew += result.newSize
        stats.count++
      }
    }
  }
}

async function main() {
  console.log('开始智能分层压缩（按网页显示尺寸）...\n')
  const stats = { totalOriginal: 0, totalNew: 0, count: 0 }
  await walk(path.join(PUBLIC_DIR, 'images'), null, stats)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`压缩完成：${stats.count} 张图片`)
  console.log(`总计：${(stats.totalOriginal/1024/1024).toFixed(2)}MB → ${(stats.totalNew/1024/1024).toFixed(2)}MB`)
  if (stats.totalOriginal > 0) {
    console.log(`节省：${((stats.totalOriginal - stats.totalNew) / stats.totalOriginal * 100).toFixed(1)}%`)
  }
}

main().catch(console.error)
