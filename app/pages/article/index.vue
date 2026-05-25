<script setup lang="ts">
// 统一使用 default layout，Hero 背景由 config 控制
import { ref, computed } from 'vue'
import type { ArticleRaw } from './data'
import { useContent } from '~/composables/useContent'
import { useLocale } from '~/composables/useLocale'

const { t } = useLocale()

// 运行时从 API 获取文章列表
const { data: articlesRaw } = await useFetch<ArticleRaw[]>('/api/articles')
const articles = useContent(articlesRaw.value || [])
const search = ref('')
const pageSize = 6
const currentPage = ref(1)

const filtered = computed(() => {
  if (!search.value.trim()) return articles.value
  const q = search.value.trim().toLowerCase()
  return articles.value.filter((a) =>
    a.title.toLowerCase().includes(q) || a.lead.toLowerCase().includes(q),
  )
})

const paged = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filtered.value.length / pageSize))

function goDetail(slug: string) {
  navigateTo(`/article/${slug}`)
}

useSeoMeta({
  title: () => t.value('article.pageTitle') + ' - QingSolve Law Firm',
  description: 'Legal practice articles written by the professional team of QingSolve Law Firm, covering commercial dispute resolution, foreign-related law, and more.',
  ogTitle: () => t.value('article.pageTitle') + ' - QingSolve Law Firm',
  ogDescription: 'Legal practice articles written by the professional team of QingSolve Law Firm.',
  ogImage: 'https://www.qs-legal.com/images/shared/hero/4.png',
  ogUrl: 'https://www.qs-legal.com/article',
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
          v-for="article in paged"
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

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          v-for="p in totalPages"
          :key="p"
          class="page-btn"
          :class="{ active: currentPage === p }"
          @click="currentPage = p"
        >
          {{ p }}
        </button>
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
.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
}
.page-btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid #2a3f38;
  background: #0f1c18;
  color: #8ba89d;
  cursor: pointer;
  font-size: 0.9rem;
}
.page-btn.active {
  background: #3a9b7f;
  color: #fff;
  border-color: #3a9b7f;
}
</style>
