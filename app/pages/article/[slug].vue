<script setup lang="ts">
// 统一使用 default layout，Hero 背景由 config 控制
import { computed } from 'vue'
import { articlesRaw } from './data'
import ArticleRenderer from '~/components/ArticleRenderer.vue'
import { useContentItem } from '~/composables/useContent'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const article = useContentItem(articlesRaw, (a) => a.slug === slug.value)

useSeoMeta({
  title: () => article.value?.title ? article.value.title + ' - 北京青颂律师事务所' : '文章详情',
  description: () => article.value?.lead ? article.value.lead.slice(0, 160) : '青颂律师事务所专业文章',
  ogTitle: () => article.value?.title ? article.value.title + ' - 北京青颂律师事务所' : '文章详情',
  ogDescription: () => article.value?.lead ? article.value.lead.slice(0, 160) : '青颂律师事务所专业文章',
  ogImage: 'https://qs-legal.com/head/5.png',
  ogUrl: () => 'https://qs-legal.com/article/' + route.params.slug,
  twitterCard: 'summary_large_image',
})

useSchemaOrg(() =>
  article.value
    ? [
        defineArticle({
          headline: article.value.title,
          description: article.value.lead,
          author: {
            '@type': 'Organization',
            name: article.value.meta.author || '青颂律师事务所',
          },
          datePublished: article.value.meta.date,
          dateModified: article.value.meta.date,
          image: 'https://qs-legal.com/head/5.png',
          publisher: {
            '@type': 'Organization',
            name: '北京青颂律师事务所',
            url: 'https://qs-legal.com',
          },
        }),
      ]
    : [],
)
</script>

<template>
  <div v-if="article" class="article-detail-page">
    <BreadcrumbBar :items="[{ label: '首页', href: '/' }, { label: '专业文章', href: '/article' }, { label: article.title }]" />
    <header class="article-header">
      <div class="qs-container">
        <h1 class="article-header__title">{{ article.title }}</h1>
        <p v-if="article.meta?.date || article.meta?.author" class="article-header__meta">
          <span v-if="article.meta?.date">{{ article.meta.date }}</span>
          <span v-if="article.meta?.author"> · {{ article.meta.author }}</span>
        </p>
      </div>
    </header>
    <ArticleRenderer :article="article" />
  </div>
  <div v-else class="article-notfound">
    <div class="qs-container">
      <p>文章不存在或已被删除</p>
      <NuxtLink to="/article">返回文章列表</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.article-detail-page {
  position: relative;
}
.article-header {
  padding: 40px 0 24px;
  text-align: center;
}
.article-header__title {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
  line-height: 1.3;
}
.article-header__meta {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}
.article-notfound {
  text-align: center;
  padding: 120px 0;
  color: var(--qs-color-text-secondary);
}
.article-notfound a {
  color: var(--qs-color-brand);
  text-decoration: none;
}
</style>
