/**
 * 百度主动推送脚本
 * 将所有页面 URL 推送给百度，加快收录
 *
 * 用法：
 *   node scripts/submit-to-baidu.cjs           # 正常推送（自动跳过已推送的）
 *   node scripts/submit-to-baidu.cjs --force   # 强制推送全部（会浪费配额，慎用）
 *   node scripts/submit-to-baidu.cjs --limit 5 # 只推送前 N 条未推送的
 *
 * 需要 Node.js 18+（内置 fetch）
 */

const fs = require('fs')
const path = require('path')

const SITE = 'https://www.qs-legal.com'
const API_URL = 'http://data.zz.baidu.com/urls?site=https://www.qs-legal.com&token=fLk2pXS57bUCs0lj'

// 已推送记录文件（gitignored，纯本地记录）
const RECORD_FILE = path.join(__dirname, '.submitted-urls.json')

// 静态页面
const staticUrls = [
  '/',
  '/aboutus',
  '/attorney',
  '/article',
  '/practice-areas',
]

// 文章详情页
const articles = require('../app/pages/article/articles.json')
const articleUrls = articles.map(a => `/article/${a.slug}`)

// 执业领域详情页
const practices = require('../app/pages/practice-areas/practices.json')
const practiceUrls = practices.map(p => `/practice-areas/${encodeURIComponent(p.slug)}`)

// 律师详情页（从后端 API 获取）
async function fetchAttorneyUrls() {
  try {
    const res = await fetch('http://localhost:8000/api/firm/attorneys/')
    if (!res.ok) return []
    const lawyers = await res.json()
    return lawyers.map(l => `/attorney/${l.id}`)
  } catch {
    console.log('⚠️  后端 API 未启动，律师详情页 URL 未获取（可后续补充推送）')
    return []
  }
}

// 读取已推送记录
function loadSubmitted() {
  try {
    const raw = fs.readFileSync(RECORD_FILE, 'utf-8')
    return new Set(JSON.parse(raw))
  } catch {
    return new Set()
  }
}

// 保存已推送记录
function saveSubmitted(set) {
  fs.writeFileSync(RECORD_FILE, JSON.stringify([...set], null, 2) + '\n', 'utf-8')
}

// 解析命令行参数
const args = process.argv.slice(2)
const force = args.includes('--force')
const limitArg = args.find(a => a.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity

async function main() {
  const submitted = loadSubmitted()
  const attorneyUrls = await fetchAttorneyUrls()

  const allPaths = [
    ...staticUrls,
    ...articleUrls,
    ...practiceUrls,
    ...attorneyUrls,
  ]

  const allUrls = allPaths.map(p => `${SITE}${p}`)

  // 过滤已推送的
  const urlsToSubmit = force
    ? allUrls
    : allUrls.filter(u => !submitted.has(u))

  if (limit !== Infinity) {
    urlsToSubmit.splice(limit)
  }

  console.log(`总 URL 数: ${allUrls.length}`)
  console.log(`已推送: ${submitted.size}`)
  console.log(`本次待推送: ${urlsToSubmit.length}`)
  console.log()

  if (urlsToSubmit.length === 0) {
    console.log('✅ 没有新的 URL 需要推送')
    return
  }

  urlsToSubmit.forEach(u => console.log('  →', u))
  console.log()

  // 百度主动推送 API：每次最多 2000 条，但配额只有 10 条/天，所以按天级分小批
  const batchSize = 10 // 贴合配额限制，每批最多 10 条
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < urlsToSubmit.length; i += batchSize) {
    const batch = urlsToSubmit.slice(i, i + batchSize)
    const body = batch.join('\n')
    const batchNum = Math.floor(i / batchSize) + 1

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body,
      })
      const result = await res.json()
      console.log(`批次 ${batchNum} (${batch.length} 条):`, result)

      if (result.success) {
        batch.forEach(u => submitted.add(u))
        successCount += result.success
      }
      if (result.error === 400 && result.message === 'over quota') {
        console.log('\n⚠️  配额已用完，停止推送')
        break
      }
    } catch (err) {
      console.error(`批次 ${batchNum} 推送失败:`, err.message)
      failCount += batch.length
    }
  }

  saveSubmitted(submitted)
  console.log('\n📊 本次推送结果：')
  console.log(`   成功: ${successCount}`)
  console.log(`   失败: ${failCount}`)
  console.log(`   累计已推送: ${submitted.size} / ${allUrls.length}`)
  console.log(`   还剩未推送: ${allUrls.length - submitted.size}`)
}

main()
