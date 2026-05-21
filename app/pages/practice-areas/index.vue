<script setup lang="ts">
// 统一使用 default layout，Hero 背景由 config 控制
import { computed } from 'vue'
import { practicesRaw } from './data'
import type { PracticeRaw } from './data'
import { useContent } from '~/composables/useContent'
import { useLocale } from '~/composables/useLocale'

const { t } = useLocale()
const practices = useContent(practicesRaw as PracticeRaw[])

function goDetail(slug: string) {
  navigateTo('/practice-areas/' + slug)
}

useSeoMeta({
  title: () => t.value('practiceAreas.pageTitle') + ' - QingSolve Law Firm',
  description: 'QingSolve Law Firm focuses on commercial legal services, covering foreign-related legal consulting, dispute resolution, enforcement, and sports law.',
  ogTitle: () => t.value('practiceAreas.pageTitle') + ' - QingSolve Law Firm',
  ogDescription: 'QingSolve Law Firm focuses on commercial legal services, covering foreign-related legal consulting, dispute resolution, enforcement, and sports law.',
  ogImage: 'https://qs-legal.com/head/7.png',
  ogUrl: 'https://qs-legal.com/practice-areas',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="pa-page">
    <BreadcrumbBar :items="[{ label: t('practiceAreas.breadcrumbHome'), href: '/' }, { label: t('practiceAreas.breadcrumbCurrent') }]" />
    <section class="pa-list">
      <div class="qs-container">
        <header class="pa-list__header">
        <h1 class="pa-list__title">{{ t('practiceAreas.pageTitle') }}</h1>
        <p class="pa-list__subtitle">
          {{ t('practiceAreas.pageSubtitle') }}
        </p>
      </header>

      <div class="pa-cards">
        <article
          v-for="p in practices"
          :key="p.slug"
          class="pa-card"
          @click="goDetail(p.slug)"
        >
          <h3 class="pa-card__title">{{ p.name }}</h3>
          <p class="pa-card__lead">{{ p.overview[0]?.slice(0, 100) }}...</p>
          <span class="pa-card__more">{{ t('practiceAreas.readMore') }} →</span>
        </article>
      </div>
    </div>
  </section>
</div>
</template>

<style scoped src="./style.css"></style>

<style scoped>
.pa-page {
  position: relative;
}
</style>
