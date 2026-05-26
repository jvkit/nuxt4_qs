import { createResolver } from '@nuxt/kit'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

const resolver = createResolver(import.meta.url)

// 从 public/content/articles 目录生成文章详情页 URL
function getArticleUrls() {
  const contentDir = join(process.cwd(), 'public', 'content', 'articles')
  const files = readdirSync(contentDir).filter((f) => f.endsWith('.json'))

  return files.map((file) => {
    const content = readFileSync(join(contentDir, file), 'utf-8')
    const article = JSON.parse(content)
    return {
      loc: `/article/${article.slug}`,
      lastmod: article.date || new Date().toISOString().split('T')[0],
      priority: 0.7 as const,
    }
  })
}

const articleUrls = getArticleUrls()

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // 注意：不要在此 ignore data.ts / style.css，否则会导致热更新失效
  ignore: [],

  // 开发服务器默认监听所有网络接口（局域网可访问）
  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },

  css: ['~/assets/css/main.css'],

  modules: ['@nuxtjs/seo', '@nuxt/image'],

  seo: {},


  site: {
    url: 'https://www.qs-legal.com',
    name: '北京青颂律师事务所',
    description: '青颂律师事务所 - 专业商事争议解决法律服务',
    defaultLocale: 'zh-CN',
  },

  sitemap: {
    exclude: ['/test'],
    urls: async () => {
      // 文章 URL
      const urls = [...articleUrls]

      // 执业领域 URL
      const paDir = join(process.cwd(), 'public', 'content', 'practice-areas')
      try {
        const paFiles = readdirSync(paDir).filter((f) => f.endsWith('.json'))
        paFiles.forEach((f) => {
          const content = readFileSync(join(paDir, f), 'utf-8')
          const pa = JSON.parse(content)
          urls.push({
            loc: `/practice-areas/${pa.slug}`,
            lastmod: new Date().toISOString().split('T')[0],
            priority: 0.7 as const,
          })
        })
      } catch {}

      // 律师 URL
      const attDir = join(process.cwd(), 'public', 'content', 'attorneys')
      try {
        const attFiles = readdirSync(attDir).filter((f) => f.endsWith('.json'))
        attFiles.forEach((f) => {
          const content = readFileSync(join(attDir, f), 'utf-8')
          const att = JSON.parse(content)
          urls.push({
            loc: `/attorney/${att.id}`,
            lastmod: new Date().toISOString().split('T')[0],
            priority: 0.7 as const,
          })
        })
      } catch {}

      return urls
    },
  },

  robots: {
    disallow: ['/api/', '/_nuxt/', '/__nuxt_devtools__'],
  },

  ogImage: {
    // 内容属性（title/description/image/component）请在页面/布局中使用 defineOgImage() 设置
    // 此处仅配置模块级渲染参数
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: '北京青颂律师事务所',
      url: 'https://www.qs-legal.com',
      logo: 'https://www.qs-legal.com/favicon.ico',
    },
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: '北京青颂律师事务所',
      meta: [
        { name: 'description', content: '青颂律师事务所 - 专业商事争议解决法律服务' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  image: {
    quality: 80,
    format: ['webp'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  nitro: {
    routeRules: {
      '/api/**': { proxy: 'http://127.0.0.1:8000/api/**' },
      '/images/**': { headers: { 'cache-control': 'public,max-age=31536000,immutable' } },
      '/data/**': { headers: { 'cache-control': 'public,max-age=31536000,immutable' } },
    },
  },
})
