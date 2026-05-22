/**
 * 根据 path-map.json 更新代码中的路径引用
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const pathMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'path-map.json'), 'utf8'))

// 按长度降序排序，避免短路径先替换导致问题
const sortedEntries = Object.entries(pathMap).sort((a, b) => b[0].length - a[0].length)

const extensions = ['.vue', '.ts', '.json', '.css', '.scss']

function walk(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.nuxt' || entry.name === '.output' || entry.name === 'public_backup') continue
      walk(fullPath, callback)
    } else if (extensions.includes(path.extname(entry.name))) {
      callback(fullPath)
    }
  }
}

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let changed = false

  for (const [oldPath, newPath] of sortedEntries) {
    // 替换普通路径引用
    if (content.includes(oldPath)) {
      // 全局替换所有出现的位置
      const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      content = content.replace(regex, newPath)
      changed = true
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content)
    console.log(`   ✓ ${path.relative(ROOT, filePath)}`)
  }
}

console.log('更新代码中的路径引用...\n')
walk(ROOT, updateFile)
console.log('\n完成！')
