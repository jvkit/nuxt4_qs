<script setup lang="ts">
// 统一使用 default layout，Hero 背景由 config 控制
import { ref, computed } from 'vue'
import { articlesRaw } from './data'
import type { Article } from './data'
import { useContent } from '~/composables/useContent'

const articles = useContent(articlesRaw)
const search = ref('')

const filtered = computed(() => {
  if (!search.value.trim()) return articles.value
  const q = search.value.trim().toLowerCase()
  return articles.value.filter((a) =>
    a.title.toLowerCase().includes(q) || a.lead.toLowerCase().includes(q),
  )
})

function goDetail(slug: string) {
  navigateTo(`/article/${slug}`)
}

useSeoMeta({
  title: '专业文章 - 北京青颂律师事务所',
  description: '青颂律师事务所专业团队撰写的法律实务文章，涵盖商事争议解决、涉外法律等多个领域。',
  ogTitle: '专业文章 - 北京青颂律师事务所',
  ogDescription: '青颂律师事务所专业团队撰写的法律实务文章，涵盖商事争议解决、涉外法律等多个领域。',
  ogImage: 'https://qs-legal.com/head/4.png',
  ogUrl: 'https://qs-legal.com/article',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="article-page">
    <BreadcrumbBar :items="[{ label: '首页', href: '/' }, { label: '专业文章' }]" />
    <section class="article-list">
      <div class="qs-container">
        <header class="article-list__header">
        <h1 class="article-list__title">专业文章</h1>
        <p class="article-list__subtitle">
          青颂律师事务所专业团队撰写的法律实务文章
        </p>
        <div class="article-list__search">
          <input
            v-model="search"
            type="text"
            placeholder="搜索文章..."
            class="search-input"
          />
        </div>
      </header>

      <div class="article-cards">
        <article
          v-for="article in filtered"
          :key="article.id"
          class="article-card"
          @click="goDetail(article.slug)"
        >
          <div class="article-card__num">{{ String(article.id).padStart(2, '0') }}</div>
          <div class="article-card__body">
            <h3 class="article-card__title">{{ article.title }}</h3>
            <p class="article-card__lead">{{ article.lead.slice(0, 120) }}...</p>
            <span class="article-card__more">阅读全文 →</span>
          </div>
        </article>
      </div>

      <p v-if="!filtered.length" class="article-list__empty">没有找到相关文章</p>
    </div>
  </section>
</div>
</template>

<style scoped src="./style.css"></style>

<style scoped>
.article-page {
  position: relative;
}
</style>
