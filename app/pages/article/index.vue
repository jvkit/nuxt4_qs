<script setup lang="ts">
// 统一使用 default layout，Hero 背景由 config 控制
import { ref, computed } from 'vue'
import { articlesRaw } from './data'
import type { ArticleRaw } from './data'
import { useContent } from '~/composables/useContent'
import { useLocale } from '~/composables/useLocale'

const { t } = useLocale()
const articles = useContent(articlesRaw as ArticleRaw[])
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
  title: () => t.value('article.pageTitle') + ' - QingSolve Law Firm',
  description: 'Legal practice articles written by the professional team of QingSolve Law Firm, covering commercial dispute resolution, foreign-related law, and more.',
  ogTitle: () => t.value('article.pageTitle') + ' - QingSolve Law Firm',
  ogDescription: 'Legal practice articles written by the professional team of QingSolve Law Firm.',
  ogImage: 'https://qs-legal.com/head/4.png',
  ogUrl: 'https://qs-legal.com/article',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="article-page">
    <BreadcrumbBar :items="[{ label: t('article.breadcrumbHome'), href: '/' }, { label: t('article.breadcrumbCurrent') }]" />
    <section class="article-list">
      <div class="qs-container">
        <header class="article-list__header">
        <h1 class="article-list__title">{{ t('article.pageTitle') }}</h1>
        <p class="article-list__subtitle">
          {{ t('article.pageSubtitle') }}
        </p>
        <div class="article-list__search">
          <input
            v-model="search"
            type="text"
            :placeholder="t('article.searchPlaceholder')"
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
            <span class="article-card__more">{{ t('article.readMore') }} →</span>
          </div>
        </article>
      </div>

      <p v-if="!filtered.length" class="article-list__empty">{{ t('article.noResult') }}</p>
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
