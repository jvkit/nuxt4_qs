import { createResolver } from '@nuxt/kit'
import articlesData from './app/pages/article/articles.json'

const resolver = createResolver(import.meta.url)

// 从 articles.json 生成文章详情页 URL
const articleUrls = (articlesData as any[]).map((a) => ({
  loc: `/article/${a.slug}`,
  lastmod: a.meta?.date || new Date().toISOString().split('T')[0],
  priority: 0.7,
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

  modules: ['@nuxtjs/seo'],

  seo: {
    canonical: true,
  },

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
            priority: 0.7,
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
    defaults: {
      component: 'NuxtSeo',
      props: {
        title: '北京青颂律师事务所',
        description: '青颂律师事务所 - 专业商事争议解决法律服务',
        image: '/about/about_us/heading.png',
      },
    },
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

  nitro: {
    routeRules: {
      '/api/**': { proxy: 'http://localhost:8000/api/**' },
    },
  },
})
