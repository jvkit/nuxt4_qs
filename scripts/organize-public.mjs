/**
 * 整理 public/ 目录结构
 * 1. 备份 public/ 到 public_backup/
 * 2. 按页面/功能重新组织图片
 * 3. 生成路径映射供后续代码替换
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PUBLIC_DIR = path.join(ROOT, 'public')
const BACKUP_DIR = path.join(ROOT, 'public_backup')

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

// 复制目录（递归）
function copyDir(src, dest) {
  ensureDir(dest)
  const entries = fs.readdirSync(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

// 移动文件
function moveFile(oldPath, newPath) {
  ensureDir(path.dirname(newPath))
  fs.renameSync(oldPath, newPath)
}

// 删除目录
function removeDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true })
}

// ============ 执行 ============

console.log('1. 备份 public/ → public_backup/')
if (fs.existsSync(BACKUP_DIR)) {
  console.log('   备份目录已存在，跳过备份')
} else {
  copyDir(PUBLIC_DIR, BACKUP_DIR)
  console.log('   备份完成')
}

console.log('\n2. 创建新目录结构')
const newDirs = [
  'images/home/hero',
  'images/home/services',
  'images/home/advantages',
  'images/aboutus',
  'images/attorney/avatars',
  'images/article/covers',
  'images/practice-areas',
  'images/shared/hero/abs',
  'images/shared/backgrounds',
  'videos',
  'data',
]
for (const d of newDirs) {
  ensureDir(path.join(PUBLIC_DIR, d))
}
console.log('   目录创建完成')

console.log('\n3. 移动文件')

const moves = [
  // 首页 Hero
  ['pic_best/buiding.png', 'images/home/hero/buiding.png'],
  ['pic_best/2.png', 'images/home/hero/2.png'],
  ['about/image1/1.jpg', 'images/home/hero/1.jpg'],
  ['about/image1/5.jpg', 'images/home/hero/5.jpg'],

  // 首页服务轮播
  ['avif/1.avif', 'images/home/services/foreign-investment.avif'],
  ['about/image1/8.jpg', 'images/home/services/8.jpg'],
  ['pic/home/practice_page/wz.png', 'images/home/services/wz.png'],
  ['pic/home/practice_page/pe.jpg', 'images/home/services/pe.jpg'],
  ['pic/home/practice_page/sw.jpg', 'images/home/services/sw.jpg'],
  ['about/image1/11.jpg', 'images/home/services/11.jpg'],
  ['about/image1/12.jpg', 'images/home/services/12.jpg'],

  // 首页优势卡片
  ['about/image1/7.jpg', 'images/home/advantages/7.jpg'],

  // 关于我们
  ['about/about_us/heading.png', 'images/aboutus/heading.png'],
  ['about/about_us/florence.jpg', 'images/aboutus/florence.jpg'],
  ['about/about_us/colosseum.jpg', 'images/aboutus/colosseum.jpg'],
  ['about/about_us/olympic-rings.png', 'images/aboutus/olympic-rings.png'],
  ['about/about_us/abstract-green.png', 'images/aboutus/abstract-green.png'],

  // 律师
  ['attorneys/attorney-header.png', 'images/attorney/attorney-header.png'],
  ['attorneys/1.jpg', 'images/attorney/1.jpg'],
  ['attorneys/2.png', 'images/attorney/2.png'],
  ['attorneys/head1.png', 'images/attorney/head1.png'],
  ['attorneys/head2.png', 'images/attorney/head2.png'],

  // 律师头像
  ...fs.readdirSync(path.join(PUBLIC_DIR, 'about/lawyer'))
    .filter(f => f.endsWith('.jpg'))
    .map(f => [`about/lawyer/${f}`, `images/attorney/avatars/${f}`]),

  // 文章封面
  ...fs.readdirSync(path.join(PUBLIC_DIR, 'article'))
    .filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i))
    .map(f => [`article/${f}`, `images/article/covers/${f}`]),

  // Hero 背景
  ...fs.readdirSync(path.join(PUBLIC_DIR, 'head'))
    .filter(f => f.match(/\.(png|jpg|jpeg)$/i) && !fs.statSync(path.join(PUBLIC_DIR, 'head', f)).isDirectory())
    .map(f => [`head/${f}`, `images/shared/hero/${f}`]),

  // Hero 抽象背景
  ...fs.readdirSync(path.join(PUBLIC_DIR, 'head/abs'))
    .filter(f => f.match(/\.(png|jpg|jpeg)$/i))
    .map(f => [`head/abs/${f}`, `images/shared/hero/abs/${f}`]),

  // 数据文件
  ['attorneys/data.json', 'data/attorneys.json'],

  // 视频（从 restore 移动）
  ...fs.readdirSync(path.join(PUBLIC_DIR, 'restore/vid'))
    .filter(f => f.endsWith('.mp4'))
    .map(f => [`restore/vid/${f}`, `videos/${f}`]),
]

const pathMap = {}
for (const [oldRel, newRel] of moves) {
  const oldPath = path.join(PUBLIC_DIR, oldRel)
  const newPath = path.join(PUBLIC_DIR, newRel)
  if (fs.existsSync(oldPath)) {
    moveFile(oldPath, newPath)
    pathMap['/' + oldRel.replace(/\\/g, '/')] = '/' + newRel.replace(/\\/g, '/')
    console.log(`   ✓ ${oldRel} → ${newRel}`)
  } else {
    console.log(`   ✗ ${oldRel} (不存在)`)
  }
}

console.log('\n4. 清理旧目录')
const dirsToRemove = [
  'about',
  'attorneys',
  'article',
  'avif',
  'head',
  'home',
  'pic',
  'pic_best',
  'restore',
]
for (const d of dirsToRemove) {
  const dirPath = path.join(PUBLIC_DIR, d)
  if (fs.existsSync(dirPath)) {
    removeDir(dirPath)
    console.log(`   ✓ 删除 ${d}/`)
  }
}

console.log('\n5. 生成路径映射文件')
fs.writeFileSync(
  path.join(ROOT, 'scripts/path-map.json'),
  JSON.stringify(pathMap, null, 2)
)
console.log('   已保存到 scripts/path-map.json')

console.log('\n完成！')
console.log('\n下一步：运行 scripts/update-references.mjs 更新代码中的路径引用')
