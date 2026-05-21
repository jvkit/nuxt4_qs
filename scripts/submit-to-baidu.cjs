/**
 * 百度主动推送脚本
 * 将所有页面 URL 推送给百度，加快收录
 *
 * 用法：
 *   node scripts/submit-to-baidu.js
 *
 * 需要 Node.js 18+（内置 fetch）
 */

const SITE = 'https://www.qs-legal.com'
const API_URL = 'http://data.zz.baidu.com/urls?site=https://www.qs-legal.com&token=fLk2pXS57bUCs0lj'

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
// 如果后端未启动，这部分为空，可手动补充或后续再推
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

async function main() {
  const attorneyUrls = await fetchAttorneyUrls()

  const allPaths = [
    ...staticUrls,
    ...articleUrls,
    ...practiceUrls,
    ...attorneyUrls,
  ]

  const allUrls = allPaths.map(p => `${SITE}${p}`)

  console.log(`共 ${allUrls.length} 个 URL 待推送：`)
  allUrls.forEach(u => console.log('  ', u))
  console.log()

  // 百度主动推送 API 限制：每次最多 2000 条
  // 分批推送（每批 500 条）
  const batchSize = 500
  for (let i = 0; i < allUrls.length; i += batchSize) {
    const batch = allUrls.slice(i, i + batchSize)
    const body = batch.join('\n')

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body,
      })
      const result = await res.json()
      console.log(`批次 ${Math.floor(i / batchSize) + 1}:`, result)
    } catch (err) {
      console.error(`批次 ${Math.floor(i / batchSize) + 1} 推送失败:`, err.message)
    }
  }

  console.log('\n✅ 推送完成')
}

main()
