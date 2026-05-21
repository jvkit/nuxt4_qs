<script setup lang="ts">
/**
 * LawyerCard.vue
 * =============
 * 这是一个典型的 "模板复用" 组件：
 * - 只定义一次 HTML 结构和 CSS 样式
 * - 通过 Props 接收不同的数据，渲染出不同的内容
 * - 父组件循环使用它，产生多个卡片
 */

import type { Lawyer } from '~/pages/attorney/data'
import { useLocale } from '~/composables/useLocale'

const { locale, t } = useLocale()

// ----------------------------------------
// Props 定义：组件的 "输入接口"
// ----------------------------------------
interface Props {
  /** 要展示的律师数据对象 */
  lawyer: Lawyer
  /**
   * 卡片布局模式
   * - 'horizontal'：横向布局（头像在左，信息在右），适合列表页
   * - 'vertical'：纵向布局（头像在上，信息在下），适合网格页
   */
  layout?: 'horizontal' | 'vertical'
}

// 给可选的 prop 设置默认值
withDefaults(defineProps<Props>(), {
  layout: 'horizontal',
})

// ----------------------------------------
// Emits 定义：组件向父组件发送的事件
// ----------------------------------------
const emit = defineEmits<{
  /** 点击 "查看详情" 按钮时触发，携带律师 id */
  (e: 'viewDetail', id: number): void
  /** 点击 "发送邮件" 时触发，携带邮箱地址 */
  (e: 'sendEmail', email: string): void
}>()

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

function displayName(lawyer: Lawyer) {
  if (locale.value === 'zh') return lawyer.name
  return lawyer.name_en || lawyer.name
}

function displayTitle(lawyer: Lawyer) {
  if (locale.value === 'zh') return lawyer.title
  const map: Record<string, string> = {
    '合伙人': 'Partner',
    '顾问': 'Consultant',
    '顾问律师/助理教授': 'Consultant Attorney / Assistant Professor',
    '资深律师': 'Senior Attorney',
    '执业律师': 'Attorney',
  }
  return lawyer.title_en || map[lawyer.title] || lawyer.title
}

function displayOffice(lawyer: Lawyer) {
  if (locale.value === 'zh') return lawyer.office
  const map: Record<string, string> = { '北京': 'Beijing', '上海': 'Shanghai', '罗马': 'Rome', '墨尔本': 'Melbourne' }
  return lawyer.office_en || map[lawyer.office] || lawyer.office
}

function displayBio(lawyer: Lawyer) {
  if (locale.value === 'zh') return lawyer.bio
  return lawyer.bio_en || lawyer.bio
}
</script>

<template>
  <!--
    动态类绑定：根据 layout prop 切换不同 CSS 类
    :class 是 Vue 的 class 绑定语法
  -->
  <article
    class="lawyer-card"
    :class="{
      'lawyer-card--horizontal': layout === 'horizontal',
      'lawyer-card--vertical': layout === 'vertical',
      'lawyer-card--featured': lawyer.featured,
    }"
  >
    <!-- 头像区域 -->
    <div class="lawyer-card__avatar-wrapper">
      <img
        :src="lawyer.avatar || lawyer.image_url"
        :alt="displayName(lawyer)"
        class="lawyer-card__avatar"
      />
      <!-- 重点推荐角标 -->
      <span v-if="lawyer.featured" class="lawyer-card__badge">{{ t('attorney.featured') }}</span>
    </div>

    <!-- 信息区域 -->
    <div class="lawyer-card__body">
      <header class="lawyer-card__header">
        <h3 class="lawyer-card__name">{{ displayName(lawyer) }}</h3>
        <span class="lawyer-card__title">{{ displayTitle(lawyer) }}</span>
        <span class="lawyer-card__office">{{ displayOffice(lawyer) }}</span>
      </header>

      <!-- 专业领域：使用 v-for 循环渲染标签 -->
      <ul class="lawyer-card__areas">
        <li
          v-for="area in lawyer.practice_areas"
          :key="area.name"
          class="lawyer-card__area-tag"
        >
          {{ translateArea(area.name) }}
        </li>
      </ul>

      <!-- 简介：限制行数，保持卡片高度统一 -->
      <p class="lawyer-card__bio">{{ displayBio(lawyer) }}</p>

      <!-- 操作按钮 -->
      <footer class="lawyer-card__actions">
        <button
          class="btn btn--primary"
          @click="emit('viewDetail', lawyer.id)"
        >
          {{ t('attorney.viewProfile') }}
        </button>
      </footer>
    </div>
  </article>
</template>

<style scoped>
/* ========================================
   组件级样式（scoped）
   只影响当前组件，不会污染全局
   ======================================== */

.lawyer-card {
  display: flex;
  background: var(--qs-color-surface);
  border-radius: var(--qs-radius);
  box-shadow: var(--qs-shadow);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.lawyer-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

/* ---- 横向布局（默认） ---- */
.lawyer-card--horizontal {
  flex-direction: row;
  align-items: flex-start;
}

.lawyer-card--horizontal .lawyer-card__avatar-wrapper {
  width: 180px;
  height: 220px;
  flex-shrink: 0;
}

.lawyer-card--horizontal .lawyer-card__body {
  padding: 24px;
  flex: 1;
}

/* ---- 纵向布局 ---- */
.lawyer-card--vertical {
  flex-direction: column;
}

.lawyer-card--vertical .lawyer-card__avatar-wrapper {
  width: 100%;
  aspect-ratio: 4 / 5;
}

.lawyer-card--vertical .lawyer-card__body {
  padding: 20px;
}

/* ---- 推荐样式（边框高亮） ---- */
.lawyer-card--featured {
  border: 2px solid var(--qs-color-brand);
}

/* ---- 头像 ---- */
.lawyer-card__avatar-wrapper {
  position: relative;
  overflow: hidden;
}

.lawyer-card__avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ---- 角标 ---- */
.lawyer-card__badge {
  position: absolute;
  top: 12px;
  left: 0;
  background: var(--qs-color-brand);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 0 4px 4px 0;
}

/* ---- 头部信息 ---- */
.lawyer-card__header {
  margin-bottom: 12px;
}

.lawyer-card__name {
  font-size: 20px;
  font-weight: 700;
  color: var(--qs-color-teal-950);
  margin-bottom: 4px;
}

.lawyer-card__title {
  display: inline-block;
  font-size: 14px;
  color: var(--qs-color-brand);
  font-weight: 600;
  margin-right: 12px;
}

.lawyer-card__office {
  display: inline-block;
  font-size: 13px;
  color: var(--qs-color-text-secondary);
}

/* ---- 专业领域标签 ---- */
.lawyer-card__areas {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  margin-bottom: 12px;
}

.lawyer-card__area-tag {
  font-size: 12px;
  padding: 4px 10px;
  background: var(--qs-color-bg);
  color: var(--qs-color-text-secondary);
  border-radius: 999px;
  border: 1px solid var(--qs-color-border);
}

/* ---- 简介 ---- */
.lawyer-card__bio {
  font-size: 14px;
  color: var(--qs-color-text-secondary);
  line-height: 1.7;
  margin-bottom: 16px;
  /* 限制最多 3 行 */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 3;
}

/* ---- 教育背景 ---- */
.lawyer-card__edu {
  margin-bottom: 16px;
}

.lawyer-card__edu dt {
  font-size: 12px;
  font-weight: 600;
  color: var(--qs-color-text);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.lawyer-card__edu dd {
  font-size: 13px;
  color: var(--qs-color-text-secondary);
  margin-left: 0;
  margin-bottom: 2px;
}

/* ---- 按钮 ---- */
.lawyer-card__actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 20px;
  border-radius: var(--qs-radius);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.85;
}

.btn--primary {
  background:#7dc3e3;
  color: #fff;
}

.btn--ghost {
  background: transparent;
  color: var(--qs-color-teal-900);
  border: 1px solid var(--qs-color-border);
}

/* ---- 响应式：小屏幕下统一变成纵向 ---- */
@media (max-width: 768px) {
  .lawyer-card--horizontal {
    flex-direction: column;
  }

  .lawyer-card--horizontal .lawyer-card__avatar-wrapper {
    width: 100%;
    height: 240px;
  }

  .lawyer-card--horizontal .lawyer-card__body {
    padding: 20px;
  }

  .lawyer-card__edu {
    display: none;
  }
}
</style>
