<script setup lang="ts">
// 统一使用 default layout，Hero 背景由 config 控制
/**
 * LawyerList.vue
 * =============
 * 律师列表页面：
 * - 从静态 JSON 获取律师数据
 * - 动态加载筛选选项
 * - 用 v-for 循环渲染多个 LawyerCard
 * - 处理 LawyerCard 抛出的事件
 * - 添加交互：筛选、切换布局模式
 */

import { ref, computed, onMounted } from 'vue'
import LawyerCard from '~/components/LawyerCard.vue'
import type { Lawyer } from './data'
import { useLocale } from '~/composables/useLocale'

const { locale, t } = useLocale()

// ----------------------------------------
// 响应式状态
// ----------------------------------------

const lawyers = ref<Lawyer[]>([])
const officeOptionsFromApi = ref<string[]>([])
const practiceAreaOptionsFromApi = ref<string[]>([])
const loading = ref(false)
const errorMsg = ref('')

/** 当前布局模式：横向列表 vs 纵向网格 */
const layoutMode = ref<'horizontal' | 'vertical'>('horizontal')

/** 当前选中的专业领域筛选条件 */
const selectedArea = ref<string>('')

/** 当前选中的办公室筛选条件 */
const selectedOffice = ref<string>('')

// 专业领域名称映射（中→英）
const areaNameMap: Record<string, string> = {
  '商事争议解决': 'Dispute Resolution',
  '执行': 'Enforcement',
  '强制执行': 'Enforcement',
  '执行异议': 'Enforcement Objection',
  '涉外法律咨询': 'Foreign-related Legal Advisory',
  '体育仲裁': 'Sports Arbitration',
  '劳动人事': 'Labour & Employment',
  '公司治理': 'Corporate Governance',
  '跨境交易': 'Cross-border Transactions',
  '并购': 'M&A',
  '合资合作': 'Joint Ventures',
  '私募股权': 'Private Equity',
  '国际仲裁': 'International Arbitration',
  'GDPR合规': 'GDPR Compliance',
  '税法服务': 'Tax Services',
  '国际税务': 'International Tax',
  '资产处置': 'Asset Disposal',
  '民商事争议': 'Civil & Commercial Disputes',
  '民商事争议解决': 'Civil & Commercial Dispute Resolution',
  '投融资': 'Investment & Financing',
  '行政诉讼': 'Administrative Litigation',
  '刑事辩护': 'Criminal Defense',
}

function translateArea(name: string) {
  if (locale.value === 'zh') return name
  return areaNameMap[name] || name
}

function translateOffice(name: string) {
  if (locale.value === 'zh') return name
  const map: Record<string, string> = { '北京': 'Beijing', '上海': 'Shanghai', '罗马': 'Rome', '墨尔本': 'Melbourne' }
  return map[name] || name
}

// ----------------------------------------
// 计算属性：派生数据
// ----------------------------------------

/** 所有可选的专业领域（包含 "全部"） */
const areaOptions = computed(() => ['', ...practiceAreaOptionsFromApi.value])

/** 所有可选的办公室（包含 "全部"） */
const officeOptions = computed(() => ['', ...officeOptionsFromApi.value])

/** 根据筛选条件过滤后的律师列表 */
const filteredLawyers = computed(() => {
  return lawyers.value.filter((lawyer) => {
    const matchArea =
      selectedArea.value === '' ||
      lawyer.practice_areas.some((a) => a.name === selectedArea.value)

    const matchOffice =
      selectedOffice.value === '' || lawyer.office === selectedOffice.value

    return matchArea && matchOffice
  })
})

// ----------------------------------------
// API 请求
// ----------------------------------------

async function fetchData() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await $fetch<{
      attorneys: Lawyer[]
      offices: string[]
      practice_areas: string[]
    }>('/attorneys/data.json')
    lawyers.value = res.attorneys
    officeOptionsFromApi.value = res.offices
    practiceAreaOptionsFromApi.value = res.practice_areas
  } catch (e) {
    errorMsg.value = t('attorney.loadError')
    console.error(e)
  } finally {
    loading.value = false
  }
}

// ----------------------------------------
// 事件处理
// ----------------------------------------

function onViewDetail(id: number) {
  navigateTo('/attorney/' + id)
}

function onSendEmail(email: string) {
  window.open('mailto:' + email)
}

// ----------------------------------------
// 生命周期
// ----------------------------------------

onMounted(() => {
  fetchData()
})

// ----------------------------------------
// SEO
// ----------------------------------------

useSeoMeta({
  title: () => t.value('attorney.pageTitle') + ' - QingSolve Law Firm',
  description: 'QingSolve Law Firm professional attorney team, covering foreign-related legal consulting, dispute resolution, enforcement, and sports law.',
  ogTitle: () => t.value('attorney.pageTitle') + ' - QingSolve Law Firm',
  ogDescription: 'QingSolve Law Firm professional attorney team, covering foreign-related legal consulting, dispute resolution, enforcement, and sports law.',
  ogImage: 'https://qs-legal.com/head/1.png',
  ogUrl: 'https://qs-legal.com/attorney',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="attorney-page">
    <BreadcrumbBar :items="[{ label: t('attorney.breadcrumbHome'), href: '/' }, { label: t('attorney.breadcrumbCurrent') }]" />
    <section class="lawyer-list">
      <div class="qs-container">
        <!-- 页面标题 -->
      <header class="lawyer-list__header">
        <h1 class="lawyer-list__title">{{ t('attorney.pageTitle') }}</h1>
        <p class="lawyer-list__subtitle">
          {{ t('attorney.pageSubtitle') }}
        </p>
      </header>

      <!-- 工具栏：筛选器 + 布局切换 -->
      <div class="lawyer-list__toolbar">
        <div class="lawyer-list__filters">
          <!-- 专业领域筛选 -->
          <label class="filter-group">
            <span class="filter-label">{{ t('attorney.filterArea') }}</span>
            <select v-model="selectedArea" class="filter-select">
              <option value="">{{ t('attorney.filterAll') }}</option>
              <option v-for="opt in practiceAreaOptionsFromApi" :key="opt" :value="opt">
                {{ translateArea(opt) }}
              </option>
            </select>
          </label>

          <!-- 办公室筛选 -->
          <label class="filter-group">
            <span class="filter-label">{{ t('attorney.filterOffice') }}</span>
            <select v-model="selectedOffice" class="filter-select">
              <option value="">{{ t('attorney.filterAll') }}</option>
              <option v-for="opt in officeOptionsFromApi" :key="opt" :value="opt">
                {{ translateOffice(opt) }}
              </option>
            </select>
          </label>
        </div>

        <!-- 布局切换按钮 -->
        <!-- <div class="lawyer-list__layout-toggle">
          <button
            class="toggle-btn"
            :class="{ 'toggle-btn--active': layoutMode === 'horizontal' }"
            @click="layoutMode = 'horizontal'"
          >
            列表
          </button>
          <button
            class="toggle-btn"
            :class="{ 'toggle-btn--active': layoutMode === 'vertical' }"
            @click="layoutMode = 'vertical'"
          >
            网格
          </button>

        </div> -->

      </div>

      <!-- 结果统计 -->
      <p v-if="!loading && !errorMsg" class="lawyer-list__count">
        {{ t('attorney.countPrefix') }} {{ filteredLawyers.length }} {{ t('attorney.countSuffix') }}
      </p>

      <!-- 加载与错误状态 -->
      <div v-if="loading" class="lawyer-list__empty">{{ t('attorney.loading') }}</div>
      <div v-else-if="errorMsg" class="lawyer-list__empty error">{{ errorMsg }}</div>

      <!--
        律师卡片列表 / 网格
        关键：用同一个 LawyerCard 组件，传入不同的 lawyer 数据
        实现 "一个模板，多份数据" 的复用
      -->
      <div
        v-else
        class="lawyer-list__grid"
        :class="{
          'lawyer-list__grid--list': layoutMode === 'horizontal',
          'lawyer-list__grid--grid': layoutMode === 'vertical',
        }"
      >
        <LawyerCard
          v-for="lawyer in filteredLawyers"
          :key="lawyer.id"
          :lawyer="lawyer"
          :layout="layoutMode"
          @view-detail="onViewDetail"
          @send-email="onSendEmail"
        />
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && !errorMsg && filteredLawyers.length === 0" class="lawyer-list__empty">
        <p>{{ t('attorney.noResult') }}</p>
      </div>
    </div>
  </section>
</div>
</template>

<style scoped src="./style.css"></style>

<style scoped>
.attorney-page {
  position: relative;
}
.attorney-page .lawyer-list {
  padding: 12px 0 60px;
}
</style>
