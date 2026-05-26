<script setup lang="ts">
definePageMeta({ layout: 'default' })
/**
 * LawyerDetail.vue
 * ================
 * 律师详情业务组件：
 * - 顶部 Hero 区域（照片 + 基本信息）
 * - 左侧导航栏 + 右侧内容区
 */

import { ref, onMounted, computed, watch } from 'vue'
import type { LawyerDetail } from './detail.data'
import { getDetailNavItems, render_markdown } from './detail.data'
import { useLocale } from '~/composables/useLocale'

const route = useRoute()
const { locale, t } = useLocale()
const lawyer = ref<LawyerDetail | null>(null)
const loading = ref(false)
const errorMsg = ref('')
const activeSection = ref('resume')

function displayName() {
  if (!lawyer.value) return ''
  if (locale.value === 'zh') return lawyer.value.name
  return lawyer.value.name_en || lawyer.value.name
}

function displayTitle() {
  if (!lawyer.value) return ''
  if (locale.value === 'zh') return lawyer.value.title
  const map: Record<string, string> = {
    '合伙人': 'Partner',
    '顾问': 'Consultant',
    '顾问律师/助理教授': 'Consultant Attorney / Assistant Professor',
    '资深律师': 'Senior Attorney',
    '执业律师': 'Attorney',
  }
  return lawyer.value.title_en || map[lawyer.value.title] || lawyer.value.title
}

function displayOffice() {
  if (!lawyer.value) return ''
  if (locale.value === 'zh') return lawyer.value.office
  const map: Record<string, string> = { '北京': 'Beijing', '上海': 'Shanghai', '罗马': 'Rome', '墨尔本': 'Melbourne' }
  return lawyer.value.office_en || map[lawyer.value.office] || lawyer.value.office
}

function displayBio() {
  if (!lawyer.value) return ''
  if (locale.value === 'zh') return lawyer.value.bio
  return lawyer.value.bio_en || lawyer.value.bio
}

function displayProfile(key: keyof AttorneyProfile) {
  if (!lawyer.value) return ''
  const enProfile = lawyer.value.profile_en
  const zhProfile = lawyer.value.profile
  if (locale.value === 'zh') {
    return zhProfile?.[key] || ''
  }
  return enProfile?.[key] || zhProfile?.[key] || ''
}

async function fetchLawyer() {
  const id = Number(route.params.id)
  if (!id) return

  loading.value = true
  errorMsg.value = ''
  try {
    lawyer.value = await $fetch<LawyerDetail>(`/api/attorneys/${id}`)
    if (!lawyer.value) {
      errorMsg.value = t('attorney.detailNotFound')
    }
  } catch (e) {
    errorMsg.value = t('attorney.detailLoadError')
    console.error(e)
  } finally {
    loading.value = false
  }
}

function scrollToSection(key: string) {
  activeSection.value = key
  const el = document.getElementById('section-' + key)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(fetchLawyer)
watch(() => route.params.id, fetchLawyer)

const detailNavItems = computed(() => getDetailNavItems())

useSeoMeta({
  title: () => lawyer.value?.name ? lawyer.value.name + ' - QingSolve Law Firm' : 'Attorney Detail',
  description: () => lawyer.value?.bio ? lawyer.value.bio.slice(0, 160) : 'QingSolve Law Firm attorney details',
  ogTitle: () => lawyer.value?.name ? lawyer.value.name + ' - QingSolve Law Firm' : 'Attorney Detail',
  ogDescription: () => lawyer.value?.bio ? lawyer.value.bio.slice(0, 160) : 'QingSolve Law Firm attorney details',
  ogImage: () => lawyer.value?.avatar ? 'https://www.qs-legal.com' + lawyer.value.avatar : 'https://www.qs-legal.com/images/shared/hero/2.png',
  ogUrl: () => 'https://www.qs-legal.com/attorney/' + route.params.id,
  twitterCard: 'summary_large_image',
})

useSchemaOrg(() =>
  lawyer.value
    ? [
        definePerson({
          name: lawyer.value.name,
          jobTitle: lawyer.value.title,
          description: lawyer.value.bio,
          image: lawyer.value.avatar
            ? 'https://www.qs-legal.com' + lawyer.value.avatar
            : undefined,
          email: lawyer.value.email,
          telephone: lawyer.value.phone,
          worksFor: {
            '@type': 'Organization',
            name: locale.value === 'zh' ? '北京青颂律师事务所' : 'Beijing QingSolve Law Firm',
            url: 'https://www.qs-legal.com',
          },
        }),
      ]
    : [],
)
</script>

<template>
  <div v-if="loading" class="lawyer-detail__loading">{{ t('attorney.detailLoading') }}</div>
  <div v-else-if="errorMsg" class="lawyer-detail__error">{{ errorMsg }}</div>
  <div v-else-if="lawyer" class="lawyer-detail">
    <BreadcrumbBar :items="[
      { label: t('attorney.breadcrumbHome'), href: '/' },
      { label: t('attorney.breadcrumbCurrent'), href: '/attorney' },
      { label: lawyer.name }
    ]" />
    <!-- 顶部 Hero -->
    <section class="lawyer-hero">
      <div class="qs-container lawyer-hero__inner">
        <div class="lawyer-hero__photo">
          <img :src="lawyer.avatar || lawyer.image_url" :alt="lawyer.name" />
        </div>
        <div class="lawyer-hero__info">
          <h1 class="lawyer-hero__name">{{ displayName() }}</h1>
          <p class="lawyer-hero__title">{{ displayTitle() }}</p>
          <a
            v-if="lawyer.email"
            :href="'mailto:' + lawyer.email"
            class="lawyer-hero__email"
          >
            {{ lawyer.email }}
          </a>
          <p v-if="lawyer.phone" class="lawyer-hero__phone">
            Direct Tel: {{ lawyer.phone }}
          </p>
          <p class="lawyer-hero__office">
            <strong>{{ displayOffice() }}</strong>
          </p>
        </div>
      </div>
    </section>

    <!-- 中部：导航 + 内容 -->
    <div class="qs-container lawyer-detail__body">
      <aside class="lawyer-detail__nav">
        <ul>
          <li
            v-for="item in detailNavItems"
            :key="item.key"
            :class="{ 'is-active': activeSection === item.key }"
            @click="scrollToSection(item.key)"
          >
            {{ t(item.i18nKey) }}
          </li>
        </ul>
      </aside>

      <main class="lawyer-detail__content">
        <!-- 简介 -->
        <section id="section-resume" class="detail-section">
          <h2>{{ t('attorney.detailResume') }}</h2>
          <div
            v-if="displayProfile('resume')"
            class="detail-section__body markdown-body"
            v-html="render_markdown(displayProfile('resume'))"
          ></div>
          <div
            v-else-if="displayBio()"
            class="detail-section__body markdown-body"
            v-html="render_markdown(displayBio())"
          ></div>
          <p v-else class="detail-section__empty">{{ t('attorney.detailEmpty') }}</p>
        </section>

        <!-- 代表性案例 -->
        <section id="section-representative_cases" class="detail-section">
          <h2>{{ t('attorney.detailCases') }}</h2>
          <div
            v-if="displayProfile('representative_cases')"
            class="detail-section__body markdown-body"
            v-html="render_markdown(displayProfile('representative_cases'))"
          ></div>
          <p v-else class="detail-section__empty">{{ t('attorney.detailEmpty') }}</p>
        </section>

        <!-- 教育背景 -->
        <section id="section-education" class="detail-section">
          <h2>{{ t('attorney.detailEducation') }}</h2>
          <div
            v-if="displayProfile('education')"
            class="detail-section__body markdown-body"
            v-html="render_markdown(displayProfile('education'))"
          ></div>
          <p v-else class="detail-section__empty">{{ t('attorney.detailEmpty') }}</p>
        </section>

        <!-- 职业资格 -->
        <section id="section-qualifications" class="detail-section">
          <h2>{{ t('attorney.detailQualifications') }}</h2>
          <div
            v-if="displayProfile('qualifications')"
            class="detail-section__body markdown-body"
            v-html="render_markdown(displayProfile('qualifications'))"
          ></div>
          <p v-else class="detail-section__empty">{{ t('attorney.detailEmpty') }}</p>
        </section>

        <!-- 工作经历 -->
        <section id="section-work_experience" class="detail-section">
          <h2>{{ t('attorney.detailWorkExp') }}</h2>
          <div
            v-if="displayProfile('work_experience')"
            class="detail-section__body markdown-body"
            v-html="render_markdown(displayProfile('work_experience'))"
          ></div>
          <p v-else class="detail-section__empty">{{ t('attorney.detailEmpty') }}</p>
        </section>

        <!-- 奖项及社会职务 -->
        <section id="section-awards" class="detail-section">
          <h2>{{ t('attorney.detailAwards') }}</h2>
          <div
            v-if="displayProfile('awards')"
            class="detail-section__body markdown-body"
            v-html="render_markdown(displayProfile('awards'))"
          ></div>
          <p v-else class="detail-section__empty">{{ t('attorney.detailEmpty') }}</p>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.lawyer-detail {
  position: relative;
}

/* ---- Hero ---- */
.lawyer-hero {
  color: #fff;
  padding: 80px 0 40px;
}

.lawyer-hero__inner {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.lawyer-hero__photo {
  width: 270px;
  height: 362px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: var(--qs-radius);
}

.lawyer-hero__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lawyer-hero__info {
  flex: 1;
}

.lawyer-hero__name {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
}

.lawyer-hero__title {
  font-size: 18px;
  color:#a5f1eb;
  margin-bottom: 12px;
}

.lawyer-hero__email {
  color:#a5f1eb;
  text-decoration: none;
  display: block;
  margin-bottom: 8px;
}

.lawyer-hero__email:hover {
  text-decoration: underline;
}

.lawyer-hero__phone,
.lawyer-hero__office {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 4px;
}

/* ---- Body Layout ---- */
.lawyer-detail__body {
  display: flex;
  gap: 40px;
  padding: 40px 0 80px;
}

/* ---- Nav Sidebar ---- */
.lawyer-detail__nav {
  width: 240px;
  flex-shrink: 0;
  position: sticky;
  top: calc(var(--qs-nav-height, 60px) + 20px);
  align-self: flex-start;
  max-height: calc(100vh - var(--qs-nav-height, 60px) - 40px);
  overflow-y: auto;
}

.lawyer-detail__nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  border-left: 3px solid var(--qs-color-border);
}

.lawyer-detail__nav li {
  padding: 12px 16px;
  cursor: pointer;
  color: var(--qs-color-text-secondary);
  font-size: 15px;
  transition: all 0.2s;
  border-left: 3px solid transparent;
  margin-left: -3px;
}

.lawyer-detail__nav li:hover {
  color: var(--qs-color-teal-900);
  background: var(--qs-color-surface);
}

.lawyer-detail__nav li.is-active {
  color: var(--qs-color-teal-900);
  font-weight: 600;
  border-left-color: var(--qs-color-brand);
  background: var(--qs-color-surface);
}

/* ---- Content ---- */
.lawyer-detail__content {
  flex: 1;
}

.detail-section {
  margin-bottom: 48px;
  scroll-margin-top: 100px;
}

.detail-section h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--qs-color-teal-950);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--qs-color-border);
}

.detail-section__body {
  font-size: 15px;
  line-height: 1.8;
  color: var(--qs-color-text);
  text-align: justify;
}

.detail-section__list {
  list-style: disc;
  padding-left: 20px;
  font-size: 15px;
  line-height: 1.8;
  color: var(--qs-color-text);
}

.detail-section__list li {
  margin-bottom: 6px;
}

.detail-section__empty {
  color: var(--qs-color-text-secondary);
  font-size: 14px;
}

/* ---- Markdown 渲染样式 ---- */
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  color: var(--qs-color-teal-950);
  font-weight: 700;
  margin: 20px 0 10px;
  line-height: 1.4;
}

.markdown-body :deep(h1) { font-size: 22px; }
.markdown-body :deep(h2) { font-size: 18px; }
.markdown-body :deep(h3) { font-size: 16px; }

.markdown-body :deep(p) {
  margin: 0 0 10px;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 20px;
  margin: 0 0 10px;
}

.markdown-body :deep(li) {
  margin-bottom: 4px;
}

.markdown-body :deep(a) {
  color: var(--qs-color-brand);
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(strong) {
  font-weight: 700;
  color: var(--qs-color-teal-950);
}

.markdown-body :deep(blockquote) {
  margin: 10px 0;
  padding: 6px 12px;
  border-left: 4px solid var(--qs-color-brand);
  background: var(--qs-color-surface);
  color: var(--qs-color-text-secondary);
}

.markdown-body :deep(code) {
  background: var(--qs-color-surface);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
}

.markdown-body :deep(pre) {
  background: var(--qs-color-surface);
  padding: 12px;
  border-radius: var(--qs-radius);
  overflow-x: auto;
  margin: 10px 0;
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
}

/* ---- Loading / Error ---- */
.lawyer-detail__loading,
.lawyer-detail__error {
  text-align: center;
  padding: 100px 0;
  color: var(--qs-color-text-secondary);
}

.lawyer-detail__error {
  color: #c0392b;
}

/* ---- Responsive ---- */
@media (max-width: 992px) {
  .lawyer-hero__inner {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .lawyer-hero__photo {
    width: 200px;
    height: 268px;
  }

  .lawyer-detail__body {
    flex-direction: column;
  }

  .lawyer-detail__nav {
    width: 100%;
  }

  .lawyer-detail__nav ul {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    border-left: none;
  }

  .lawyer-detail__nav li {
    border-left: none;
    border-radius: var(--qs-radius);
    background: var(--qs-color-surface);
    margin-left: 0;
    padding: 8px 16px;
  }

  .lawyer-detail__nav li.is-active {
    background: var(--qs-color-teal-900);
    color: #fff;
    border-left-color: transparent;
  }
}
</style>
