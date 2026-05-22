<script setup lang="ts">
definePageMeta({ layout: 'plain' })
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useLocale } from '~/composables/useLocale'
import {
  getServiceCarouselItems,
  getAdvantageCards,
  getHomeData,
} from './home/data'

const { locale, t } = useLocale()

const hd = computed(() => getHomeData(locale.value))

useSeoMeta({
  title: () => locale.value === 'zh'
    ? '北京青颂律师事务所 - 专注商事争议解决'
    : 'QingSong Law Firm - Commercial Dispute Resolution',
  description: () => locale.value === 'zh'
    ? '北京青颂律师事务所成立于2004年，是一家公司化运营的精品律师事务所，专注涉外法律咨询、争议解决、执行领域及体育法律服务。'
    : 'Founded in 2004, QingSong Law Firm is a corporate boutique firm specializing in foreign-related legal consulting, dispute resolution, enforcement, and sports law.',
  ogTitle: () => locale.value === 'zh'
    ? '北京青颂律师事务所 - 专注商事争议解决'
    : 'QingSong Law Firm - Commercial Dispute Resolution',
  ogDescription: () => locale.value === 'zh'
    ? '北京青颂律师事务所成立于2004年，是一家公司化运营的精品律师事务所，专注涉外法律咨询、争议解决、执行领域及体育法律服务。'
    : 'Founded in 2004, QingSong Law Firm is a corporate boutique firm specializing in foreign-related legal consulting, dispute resolution, enforcement, and sports law.',
  ogImage: 'https://qs-legal.com/about/about_us/heading.png',
  ogUrl: 'https://qs-legal.com/',
  twitterCard: 'summary_large_image',
})

const activeImpactTab = ref(0)
const activeTimelineTab = ref(0)

/* ================================
   Hero 轮播图
   ================================ */
interface Slide {
  id: number
  image: string
  title: string
  subtitle: string
}

const slides = computed<Slide[]>(() => [
  { id: 1, image: '/about/image1/5.jpg', title: t.value('hero.slide1Title'), subtitle: t.value('hero.slide1Subtitle') },
  { id: 2, image: '/pic_best/buiding.png', title: t.value('hero.slide2Title'), subtitle: t.value('hero.slide2Subtitle') },
  { id: 3, image: '/about/image1/1.jpg', title: t.value('hero.slide3Title'), subtitle: t.value('hero.slide3Subtitle') },
  { id: 4, image: '/pic_best/2.png', title: t.value('hero.slide4Title'), subtitle: t.value('hero.slide4Subtitle') },
])

const active_index = ref(0)
const is_playing = ref(true)
let timer: ReturnType<typeof setInterval> | null = null

const next = () => {
  active_index.value = (active_index.value + 1) % slides.value.length
}
const go_to_slide = (i: number) => {
  active_index.value = i
  reset_timer()
}
const toggle_autoplay = () => {
  is_playing.value = !is_playing.value
  if (is_playing.value) { start_timer() }
  else { if (timer) clearInterval(timer) }
}
const start_timer = () => {
  if (timer) clearInterval(timer)
  timer = setInterval(next, 6000)
}
const reset_timer = () => {
  if (is_playing.value) start_timer()
}
const pause_timer = () => { if (timer) clearInterval(timer) }
const resume_timer = () => { if (is_playing.value) start_timer() }

const on_key = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft') {
    active_index.value = (active_index.value - 1 + slides.value.length) % slides.value.length
    reset_timer()
  } else if (e.key === 'ArrowRight') {
    next()
    reset_timer()
  }
}

/* ================================
   核心服务轮播 (Peek Carousel)
   ================================ */
const active_service_index = ref(0)
const serviceCarouselItems = computed(() => getServiceCarouselItems(locale.value))
const service_len = () => serviceCarouselItems.value.length

const service_slide_class = (i: number) => {
  const diff = (i - active_service_index.value + service_len()) % service_len()
  if (diff === 0) return 'active'
  if (diff === 1 || diff === -(service_len() - 1)) return 'next'
  if (diff === service_len() - 1 || diff === -1) return 'prev'
  return 'hidden'
}

const next_service = () => {
  active_service_index.value = (active_service_index.value + 1) % service_len()
}
const prev_service = () => {
  active_service_index.value = (active_service_index.value - 1 + service_len()) % service_len()
}
const handle_service_click = (i: number) => {
  const cls = service_slide_class(i)
  if (cls === 'next') next_service()
  else if (cls === 'prev') prev_service()
  else if (cls === 'active') {
    const item = serviceCarouselItems.value[i]
    if (item?.link) window.open(item.link, '_self')
  }
}

let service_timer: ReturnType<typeof setInterval> | null = null
const SERVICE_AUTO_DELAY = 6000

const start_service_auto = () => {
  if (service_timer) clearInterval(service_timer)
  service_timer = setInterval(next_service, SERVICE_AUTO_DELAY)
}
const pause_service_auto = () => { if (service_timer) clearInterval(service_timer) }
const resume_service_auto = () => { start_service_auto() }

onMounted(() => {
  start_timer()
  window.addEventListener('keydown', on_key)
  start_service_auto()
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
  window.removeEventListener('keydown', on_key)
  if (service_timer) clearInterval(service_timer)
})
</script>

<template>
  <div class="about-page">
    <!-- 1. Hero 轮播区 -->
    <section class="hero-section" @mouseenter="pause_timer" @mouseleave="resume_timer">
      <div class="slide-background">
        <div
          v-for="(slide, i) in slides"
          :key="slide.id"
          class="slide-image"
          :class="{ active: i === active_index }"
          :style="{ backgroundImage: `url(${slide.image})` }"
        ></div>
      </div>
      <div class="gradient-overlay"></div>
      <div class="bottom-vignette"></div>
      <div class="slogan-overlay">
        <div class="slogan-box">
          <transition name="text" mode="out-in">
            <div :key="active_index">
              <div class="slogan-line">{{ slides[active_index]?.title }}</div>
              <div class="slogan-line slogan-line--sub">{{ slides[active_index]?.subtitle }}</div>
            </div>
          </transition>
        </div>
      </div>
      <div class="bottom-indicators">
        <button class="play-btn" @click="toggle_autoplay">
          <svg v-if="is_playing" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <div class="dots">
          <button
            v-for="(slide, i) in slides"
            :key="slide.id"
            class="dot"
            :class="{ active: i === active_index }"
            @click="go_to_slide(i)"
          ></button>
        </div>
      </div>
    </section>

    <!-- 2. 主标题区 -->
    <section class="title-section">
      <div class="qs-container title-inner">
        <h1 class="main-title">{{ hd.heroData.title }}</h1>
        <p class="main-desc">{{ hd.heroData.description }}</p>
      </div>
    </section>

    <!-- 3. 核心服务轮播 -->
    <section class="carousel-section" @mouseenter="pause_service_auto" @mouseleave="resume_service_auto">
      <div
        v-for="(item, i) in serviceCarouselItems"
        :key="i"
        class="slide"
        :class="service_slide_class(i)"
        @click="handle_service_click(i)"
      >
        <div class="slide-bg" :style="{ backgroundImage: `url(${item.image})` }"></div>
        <div class="slide-content">
          <div class="category">{{ item.category }}</div>
          <h2 class="title">{{ item.title }}</h2>
          <span v-if="item.link === '#'" class="read-more">EXPLORE</span>
        <a v-else class="read-more" :href="item.link" @click.stop>EXPLORE</a>
        </div>
      </div>
    </section>

    <!-- 4. 影响力 Tabs -->
    <section class="impact-section">
      <div class="qs-container impact-header">
        <h2 class="section-title">{{ t('home.impactTitle') }}</h2>
        <p class="section-desc">
          {{ t('home.impactDesc') }}
        </p>
      </div>
      <div class="tabs-wrapper">
        <div class="tab-list" role="tablist">
          <button
            v-for="(tab, idx) in hd.impactTabs"
            :key="tab.id"
            role="tab"
            class="tab-btn"
            :class="{ active: activeImpactTab === idx }"
            :aria-selected="activeImpactTab === idx"
            @click="activeImpactTab = idx"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="tab-panels">
          <div
            v-for="(tab, idx) in hd.impactTabs"
            :key="tab.id"
            v-show="activeImpactTab === idx"
            role="tabpanel"
            class="tab-panel"
          >
            <div class="brick-grid">
              <div
                v-for="(brick, bidx) in tab.bricks"
                :key="bidx"
                class="brick-card"
                :style="{ gridColumn: 'span ' + brick.span }"
              >
                <div class="brick-value">{{ brick.value }}</div>
                <div class="brick-label">{{ brick.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. 理念区 -->
    <section class="philosophy-section">
      <div class="qs-container philosophy-inner">
        <h2 class="section-title">{{ hd.philosophyData.title }}</h2>
        <p class="section-desc">{{ hd.philosophyData.description }}</p>
        <div class="cta-wrap">
          <a :href="hd.philosophyData.ctaHref" class="outline-btn">{{ hd.philosophyData.ctaText }}</a>
        </div>
      </div>
    </section>

    <!-- 6. 优势卡片 -->
    <section class="advantages-section">
      <div class="qs-container advantages-inner">
        <NuxtLink
          v-for="card in getAdvantageCards(locale)"
          :key="card.id"
          :to="card.link"
          class="advantage-card"
        >
          <div class="card-media">
            <img :src="card.image" :alt="card.title" loading="lazy" />
          </div>
          <div class="card-body light">
            <h3 class="card-title">{{ card.title }}</h3>
            <p class="card-desc">{{ card.description }}</p>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- 7. 发展时间线 -->
    <section class="timeline-section">
      <div class="qs-container timeline-header">
        <h2 class="section-title light">{{ t('home.timelineTitle') }}</h2>
        <p class="section-desc light">
          {{ t('home.timelineDesc') }}
        </p>
      </div>
      <div class="tabs-wrapper dark">
        <div class="tab-list" role="tablist">
          <button
            v-for="(tab, idx) in hd.timelineTabs"
            :key="tab.id"
            role="tab"
            class="tab-btn light"
            :class="{ active: activeTimelineTab === idx }"
            :aria-selected="activeTimelineTab === idx"
            @click="activeTimelineTab = idx"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="tab-panels">
          <div
            v-for="(tab, idx) in hd.timelineTabs"
            :key="tab.id"
            v-show="activeTimelineTab === idx"
            role="tabpanel"
            class="tab-panel"
          >
            <div class="timeline-grid">
              <div
                v-for="(evt, eidx) in tab.events"
                :key="eidx"
                class="timeline-card"
              >
                <h3 class="timeline-year">{{ evt.year }}</h3>
                <p class="timeline-desc">{{ evt.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 8. ESG 理念 -->
    <section class="esg-section">
      <div class="qs-container esg-inner">
        <h2 class="section-title light">{{ hd.esgData.title }}</h2>
        <div class="esg-body">
          <p v-for="(p, idx) in hd.esgData.paragraphs" :key="idx" class="esg-para">
            {{ p }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped src="./home/style.css"></style>
