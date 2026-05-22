<script setup lang="ts">
/**
 * article.vue
 * ===========
 * 法律专业文章渲染组件
 * 接收结构化 Article 数据，渲染为精美的文章页面
 */

import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useLocale } from '~/composables/useLocale'
import type { Article, ArticleBlock } from '~/pages/article/data'

const props = defineProps<{ article: Article }>()
const { t } = useLocale()

/* ---------- TOC ---------- */
const tocHeadings = computed(() => {
  const items: { id: string; text: string; level: number }[] = []
  props.article.blocks.forEach((b) => {
    if (b.type === 'h2' || b.type === 'h3') {
      const id = slugify(b.text || '')
      items.push({ id, text: b.text || '', level: b.type === 'h2' ? 2 : 3 })
    }
  })
  return items
})

function slugify(text: string) {
  return text.replace(/[^\w\u4e00-\u9fa5]/g, '').slice(0, 20)
}

const activeId = ref('')

function onScroll() {
  const headings = document.querySelectorAll('.art-h2, .art-h3')
  let current = ''
  headings.forEach((h) => {
    const rect = h.getBoundingClientRect()
    if (rect.top < 120) current = h.id
  })
  if (current) activeId.value = current

  /* progress */
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  progress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0

  /* back-to-top */
  showTop.value = scrollTop > 500
}

function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/* ---------- Progress ---------- */
const progress = ref(0)
const showTop = ref(false)

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  nextTick(onScroll)
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))

/* ---------- Block renderer helper ---------- */
function blockId(block: ArticleBlock, idx: number) {
  if (block.type === 'h2' || block.type === 'h3') {
    return slugify(block.text || '')
  }
  return `b-${idx}`
}

function isLawTitle(block: ArticleBlock) {
  return block.type === 'law' && block.title && block.title.startsWith('《')
}
</script>

<template>
  <!-- Progress bar -->
  <div class="progress-bar">
    <div class="progress-fill" :style="{ width: progress + '%' }" />
  </div>

  <!-- Main -->
  <div class="qs-container art-layout">
    <!-- TOC Sidebar -->
    <aside class="art-sidebar">
      <div class="art-sidebar__title">目录导航</div>
      <nav class="art-toc">
        <button
          v-for="item in tocHeadings"
          :key="item.id"
          type="button"
          :class="{ 'art-toc__link': true, 'is-active': activeId === item.id, 'is-h3': item.level === 3 }"
          @click="scrollToId(item.id)"
        >
          {{ item.text }}
        </button>
      </nav>
    </aside>

    <!-- Content -->
    <article class="art-body">
      <div class="art-lead">{{ article.lead }}</div>

      <template v-for="(block, idx) in article.blocks" :key="idx">
        <!-- Heading -->
        <h2
          v-if="block.type === 'h2'"
          :id="blockId(block, idx)"
          class="art-h2"
        >
          {{ block.text }}
        </h2>
        <h3
          v-else-if="block.type === 'h3'"
          :id="blockId(block, idx)"
          class="art-h3"
        >
          {{ block.text }}
        </h3>
        <h4
          v-else-if="block.type === 'h4'"
          class="art-h4"
        >
          {{ block.text }}
        </h4>

        <!-- Paragraph -->
        <p v-else-if="block.type === 'p'" class="art-p">{{ block.text }}</p>

        <!-- List item -->
        <div v-else-if="block.type === 'list-item'" class="art-list-item">
          <span class="art-list-num">{{ block.text?.match(/^\d+/)?.[0] }}</span>
          <span>{{ block.text?.replace(/^\d+\.\s*/, '') }}</span>
        </div>

        <!-- Law Block -->
        <div v-else-if="block.type === 'law'" class="art-law">
          <div v-if="isLawTitle(block)" class="art-law__title">{{ block.title }}</div>
          <div v-else-if="block.title" class="art-law__label">{{ block.title }}</div>
          <div class="art-law__content">{{ block.content }}</div>
        </div>

        <!-- Case Block -->
        <div v-else-if="block.type === 'case'" class="art-case">
          <div class="art-case__header">
            <span class="art-case__badge">{{ block.badge }}</span>
            <span class="art-case__id">{{ block.caseId }}</span>
          </div>
          <p class="art-case__content">{{ block.content }}</p>
        </div>

        <!-- Viewpoint Card -->
        <div v-else-if="block.type === 'viewpoint'" class="art-viewpoint">
          <div class="art-viewpoint__num">{{ block.title?.match(/[一二三四五六七八九十]+/)?.[0] }}</div>
          <div class="art-viewpoint__body">
            <h4 class="art-viewpoint__title">{{ block.title }}</h4>
            <p v-if="block.content" class="art-viewpoint__text">{{ block.content }}</p>
          </div>
        </div>
      </template>

      <!-- Conclusion -->
      <section v-if="article.conclusion" class="art-conclusion">
        <h2>{{ t('article.conclusion') }}</h2>
        <p>{{ article.conclusion }}</p>
      </section>

      <!-- References -->
      <section v-if="article.references.length" class="art-references">
        <h3>{{ t('article.references') }}</h3>
        <ol>
          <li v-for="(ref, i) in article.references" :key="i">{{ ref }}</li>
        </ol>
      </section>
    </article>
  </div>

  <!-- Back to top -->
  <button
    class="art-backtop"
    :class="{ 'is-visible': showTop }"
    @click="scrollToTop()"
  >
    ↑
  </button>
</template>

<style scoped>
/* Progress */
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: transparent;
  z-index: 1000;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--qs-color-teal-900), var(--qs-color-brand));
  transition: width 0.1s;
}

/* Layout */
.art-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 3rem;
  padding: 3rem 0 5rem;
  align-items: start;
}

/* Sidebar */
.art-sidebar {
  position: sticky;
  top: calc(var(--qs-nav-height) + 24px);
  background: #fff;
  border-radius: var(--qs-radius);
  padding: 1.5rem;
  box-shadow: var(--qs-shadow);
  border: 1px solid var(--qs-color-border);
}
.art-sidebar__title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--qs-color-text-secondary);
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--qs-color-border);
}
.art-toc {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.art-toc__link {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--qs-color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  border-left: 2px solid transparent;
  text-decoration: none;
  background: transparent;
  font-family: inherit;
}
.art-toc__link:hover {
  background: var(--qs-color-bg);
  color: var(--qs-color-teal-900);
}
.art-toc__link.is-active {
  background: #f0f4f8;
  color: var(--qs-color-teal-900);
  border-left-color: var(--qs-color-brand);
  font-weight: 500;
}
.art-toc__link.is-h3 {
  padding-left: 1.5rem;
  font-size: 0.8rem;
}

/* Body */
.art-body {
  background: #fff;
  border-radius: var(--qs-radius);
  padding: 3rem;
  box-shadow: var(--qs-shadow);
  border: 1px solid var(--qs-color-border);
}
.art-lead {
  font-size: 1.05rem;
  color: var(--qs-color-text-secondary);
  line-height: 1.8;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--qs-color-border);
}

/* Headings */
.art-h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--qs-color-teal-950);
  margin: 2.5rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--qs-color-brand);
  display: inline-block;
}
.art-h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--qs-color-teal-900);
  margin: 1.8rem 0 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.art-h3::before {
  content: '';
  width: 5px;
  height: 20px;
  background: var(--qs-color-brand);
  border-radius: 3px;
}
.art-h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--qs-color-text);
  margin: 1.2rem 0 0.6rem;
}

/* Paragraph */
.art-p {
  margin-bottom: 1rem;
  line-height: 1.8;
  text-align: justify;
}

/* List item */
.art-list-item {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  line-height: 1.7;
  padding-left: 0.5rem;
}
.art-list-num {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  background: var(--qs-color-brand);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
}

/* Law Block */
.art-law {
  background: #f0f4f8;
  border-left: 4px solid #3182ce;
  border-radius: 0 var(--qs-radius) var(--qs-radius) 0;
  padding: 1.5rem 1.75rem;
  margin: 1.25rem 0;
  position: relative;
}
.art-law__title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #3182ce;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.art-law__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--qs-color-text-secondary);
  margin-bottom: 0.5rem;
}
.art-law__content {
  font-size: 0.95rem;
  color: var(--qs-color-teal-900);
  line-height: 1.8;
  white-space: pre-line;
}

/* Case Block */
.art-case {
  background: #fffaf0;
  border-left: 4px solid #dd6b20;
  border-radius: 0 var(--qs-radius) var(--qs-radius) 0;
  padding: 1.25rem 1.5rem;
  margin: 1rem 0;
}
.art-case__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.art-case__badge {
  background: #dd6b20;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  letter-spacing: 0.05em;
}
.art-case__id {
  font-family: monospace;
  font-size: 0.8rem;
  color: #dd6b20;
  font-weight: 600;
}
.art-case__content {
  font-size: 0.95rem;
  color: #744210;
  line-height: 1.7;
  margin: 0;
}

/* Viewpoint */
.art-viewpoint {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border: 1px solid var(--qs-color-border);
  border-radius: var(--qs-radius);
  padding: 1.25rem 1.5rem 1.25rem 3.5rem;
  margin: 1rem 0;
  position: relative;
}
.art-viewpoint__num {
  position: absolute;
  left: 1rem;
  top: 1.25rem;
  width: 30px;
  height: 30px;
  background: var(--qs-color-teal-950);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}
.art-viewpoint__title {
  margin: 0 0 0.4rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--qs-color-teal-950);
}
.art-viewpoint__text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--qs-color-text);
  line-height: 1.7;
}

/* Conclusion */
.art-conclusion {
  background: linear-gradient(135deg, var(--qs-color-teal-950) 0%, var(--qs-color-teal-900) 100%);
  color: #fff;
  padding: 2rem 2.5rem;
  border-radius: var(--qs-radius);
  margin-top: 2.5rem;
}
.art-conclusion h2 {
  color: #fff;
  border-bottom-color: var(--qs-color-brand);
  margin-top: 0;
}
.art-conclusion p {
  color: rgba(255,255,255,0.9);
  line-height: 1.8;
}

/* References */
.art-references {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--qs-color-border);
}
.art-references h3 {
  font-size: 1rem;
  color: var(--qs-color-text-secondary);
  margin-bottom: 1rem;
}
.art-references h3::before {
  background: var(--qs-color-text-secondary);
  height: 16px;
}
.art-references ol {
  margin-left: 1.25rem;
  color: var(--qs-color-text-secondary);
  font-size: 0.875rem;
  line-height: 1.8;
}
.art-references li {
  margin-bottom: 0.4rem;
}

/* Back to top */
.art-backtop {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 44px;
  height: 44px;
  background: #fff;
  border: 1px solid var(--qs-color-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--qs-shadow);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s;
  z-index: 998;
  font-size: 1.2rem;
  color: var(--qs-color-teal-900);
}
.art-backtop.is-visible {
  opacity: 1;
  transform: translateY(0);
}
.art-backtop:hover {
  background: var(--qs-color-teal-900);
  color: #fff;
  border-color: var(--qs-color-teal-900);
}

/* Responsive */
@media (max-width: 1024px) {
  .art-layout {
    grid-template-columns: 1fr;
  }
  .art-sidebar {
    position: relative;
    top: 0;
    order: -1;
  }
  .art-toc {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .art-toc__link {
    border-left: none;
    border: 1px solid var(--qs-color-border);
    white-space: nowrap;
  }
}
@media (max-width: 768px) {
  .art-body {
    padding: 1.5rem;
  }
  .art-hero {
    padding: calc(var(--qs-nav-height) + 32px) 0 32px;
  }
}
</style>
