/**
 * 批量压缩 public/ 目录下的图片
 * 用法: node scripts/compress-images.js
 */
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const PUBLIC_DIR = path.resolve(__dirname, '../public')

// 支持的图片格式
const EXTENSIONS = ['.jpg', '.jpeg', '.png']

// 最大宽度（超过则缩放）
const MAX_WIDTH = 1920

async function processFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (!EXTENSIONS.includes(ext)) return

  const originalSize = fs.statSync(filePath).size
  const buffer = fs.readFileSync(filePath)

  let pipeline = sharp(buffer)
  const metadata = await pipeline.metadata()

  // 如果宽度超过 MAX_WIDTH，等比缩放
  if (metadata.width && metadata.width > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, undefined, { withoutEnlargement: true })
  }

  // 根据格式处理
  let outputBuffer
  if (ext === '.png') {
    outputBuffer = await pipeline.png({ quality: 85, compressionLevel: 9 }).toBuffer()
  } else {
    outputBuffer = await pipeline.jpeg({ quality: 80, progressive: true, mozjpeg: true }).toBuffer()
  }

  fs.writeFileSync(filePath, outputBuffer)

  const newSize = outputBuffer.length
  const saved = ((originalSize - newSize) / originalSize * 100).toFixed(1)
  console.log(`✓ ${path.relative(PUBLIC_DIR, filePath)}: ${(originalSize/1024/1024).toFixed(2)}MB → ${(newSize/1024/1024).toFixed(2)}MB (-${saved}%)`)
}

async function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(fullPath)
    } else {
      await processFile(fullPath)
    }
  }
}

async function main() {
  console.log('开始压缩图片...\n')
  await walk(PUBLIC_DIR)
  console.log('\n完成')
}

main().catch(console.error)
