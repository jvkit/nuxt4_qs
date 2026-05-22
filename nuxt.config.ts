import { createResolver } from '@nuxt/kit'
import articlesData from './app/pages/article/articles.json'

const resolver = createResolver(import.meta.url)

// 从 articles.json 生成文章详情页 URL
const articleUrls = (articlesData as any[]).map((a) => ({
  loc: `/article/${a.slug}`,
  lastmod: a.meta?.date || new Date().toISOString().split('T')[0],
  priority: 0.7 as const,
}))

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
    url: 'https://qs-legal.com',
    name: '北京青颂律师事务所',
    description: '青颂律师事务所 - 专业商事争议解决法律服务',
    defaultLocale: 'zh-CN',
  },

  sitemap: {
    exclude: ['/test'],
    urls: async () => {
      // 静态文章 URL
      const urls = [...articleUrls]

      // 尝试从后端获取律师列表，生成律师详情页 URL
      try {
        const lawyers = await $fetch<any[]>('http://localhost:8000/api/firm/attorneys/')
        lawyers.forEach((l) => {
          urls.push({
            loc: `/attorney/${l.id}`,
            lastmod: new Date().toISOString().split('T')[0],
            priority: 0.7 as const,
          })
        })
      } catch {
        // 后端未启动时静默忽略
      }

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
      url: 'https://qs-legal.com',
      logo: 'https://qs-legal.com/favicon.ico',
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
      '/api/**': { proxy: 'http://localhost:8000/api/**' },
      '/images/**': { headers: { 'cache-control': 'public,max-age=31536000,immutable' } },
      '/data/**': { headers: { 'cache-control': 'public,max-age=31536000,immutable' } },
    },
  },
})
