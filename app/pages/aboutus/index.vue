<script setup lang="ts">
definePageMeta({ layout: 'plain' })
import { onMounted } from 'vue'
import { useLocale } from '~/composables/useLocale'

const { locale, t } = useLocale()

useSeoMeta({
  title: () => locale.value === 'zh' ? '关于我们 - 北京青颂律师事务所' : 'About Us - QingSolve Law Firm',
  description: () => locale.value === 'zh'
    ? '北京青颂律师事务所成立于2004年，是一家公司化运营的精品律师事务所，专注涉外法律咨询、争议解决、执行领域及体育法律服务。'
    : 'Beijing QingSolve Partners was established in 2004. It is a boutique law firm providing comprehensive legal services with a special focus on foreign-related matters, dispute resolution, enforcement and sports legal services.',
  ogTitle: () => locale.value === 'zh' ? '关于我们 - 北京青颂律师事务所' : 'About Us - QingSolve Law Firm',
  ogDescription: () => locale.value === 'zh'
    ? '北京青颂律师事务所成立于2004年，是一家公司化运营的精品律师事务所，专注涉外法律咨询、争议解决、执行领域及体育法律服务。'
    : 'Beijing QingSolve Partners was established in 2004. It is a boutique law firm providing comprehensive legal services.',
  ogImage: 'https://qs-legal.com/about/about_us/heading.png',
  ogUrl: 'https://qs-legal.com/aboutus',
  twitterCard: 'summary_large_image',
})

onMounted(() => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  }, observerOptions)

  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el))
})

function scrollToAnchor(selector: string) {
  const element = document.querySelector(selector)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}
</script>

<template>
  <div class="about-us">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-badge">{{ t('aboutus.heroBadge') }}</div>
        <h1>{{ t('aboutus.heroTitle') }}</h1>
        <div class="hero-divider"></div>
        <p class="hero-subtitle">{{ t('aboutus.heroSubtitle') }}</p>
      </div>
    </section>

    <!-- Sticky Sub-Nav -->
    <nav class="nav-bar">
      <div class="nav-inner">
        <ul class="nav-links">
          <li><a href="#intro" @click.prevent="scrollToAnchor('#intro')">{{ t('aboutus.navIntro') }}</a></li>
          <li><a href="#services" @click.prevent="scrollToAnchor('#services')">{{ t('aboutus.navServices') }}</a></li>
          <li><a href="#network" @click.prevent="scrollToAnchor('#network')">{{ t('aboutus.navNetwork') }}</a></li>
          <li><a href="#philosophy" @click.prevent="scrollToAnchor('#philosophy')">{{ t('aboutus.navPhilosophy') }}</a></li>
          <li><a href="#esg" @click.prevent="scrollToAnchor('#esg')">{{ t('aboutus.navEsg') }}</a></li>
        </ul>
      </div>
    </nav>

    <!-- Intro -->
    <section id="intro" class="intro-section">
      <div class="qs-container">
        <div class="section-header fade-in">
          <h2>{{ t('aboutus.introTitle') }}</h2>
          <div class="divider"></div>
        </div>
        <div class="intro-layout">
          <div class="intro-text fade-in">
            <p>{{ t('aboutus.introP1') }}</p>
            <p>{{ t('aboutus.introP2') }}</p>
          </div>
          <div class="intro-image fade-in">
            <img src="/about/about_us/florence.jpg" :alt="t('aboutus.introTitle')" />
          </div>
        </div>

        <div class="intro-stats fade-in">
          <div class="stat-card">
            <span class="stat-number">2004</span>
            <div class="stat-label">{{ t('aboutus.statYear') }}</div>
          </div>
          <div class="stat-card">
            <span class="stat-number">20+</span>
            <div class="stat-label">{{ t('aboutus.statLawyers') }}</div>
          </div>
          <div class="stat-card">
            <span class="stat-number">10+</span>
            <div class="stat-label">{{ t('aboutus.statCountries') }}</div>
          </div>
          <div class="stat-card">
            <span class="stat-number">20</span>
            <div class="stat-label">{{ t('aboutus.statExperience') }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services -->
    <section id="services" class="services-section">
      <div class="qs-container">
        <div class="section-header fade-in">
          <h2>{{ t('aboutus.servicesTitle') }}</h2>
          <div class="divider"></div>
          <p class="section-subtitle">{{ t('aboutus.servicesSubtitle') }}</p>
        </div>
        <div class="services-grid">
          <div class="service-card fade-in">
            <div class="service-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3v15"/>
                <path d="M5 21h14"/>
                <path d="M5 5l-2 5h4z"/>
                <path d="M19 5l-2 5h4z"/>
                <path d="M5 5h14"/>
              </svg>
            </div>
            <h3>{{ t('aboutus.serviceForeign') }}</h3>
            <p>{{ t('aboutus.serviceForeignDesc') }}</p>
          </div>
          <div class="service-card fade-in">
            <div class="service-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <h3>{{ t('aboutus.serviceDispute') }}</h3>
            <p>{{ t('aboutus.serviceDisputeDesc') }}</p>
          </div>
          <div class="service-card fade-in">
            <div class="service-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <h3>{{ t('aboutus.serviceEnforcement') }}</h3>
            <p>{{ t('aboutus.serviceEnforcementDesc') }}</p>
          </div>
          <div class="service-card fade-in service-card--sports">
            <div class="service-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
              </svg>
            </div>
            <h3>{{ t('aboutus.serviceSports') }}</h3>
            <p>{{ t('aboutus.serviceSportsDesc') }}</p>
            <img class="sports-accent" src="/about/about_us/olympic-rings.png" alt="Olympic Rings" />
          </div>
        </div>
      </div>
    </section>

    <!-- Network -->
    <section id="network" class="network-section">
      <div class="network-bg">
        <img src="/about/about_us/colosseum.jpg" alt="Colosseum" />
      </div>
      <div class="network-overlay"></div>
      <div class="qs-container network-content">
        <div class="section-header fade-in">
          <h2>{{ t('aboutus.networkTitle') }}</h2>
          <div class="divider"></div>
          <p class="section-subtitle">{{ t('aboutus.networkSubtitle') }}</p>
        </div>
        <div class="countries-grid fade-in">
          <span class="country-tag">意大利</span>
          <span class="country-tag">德国</span>
          <span class="country-tag">西班牙</span>
          <span class="country-tag">波兰</span>
          <span class="country-tag">澳大利亚</span>
          
          <span class="country-tag">新加坡</span>
          <span class="country-tag">日本</span>
          <span class="country-tag">泰国</span>
          <span class="country-tag">韩国</span>
          <span class="country-tag">美国</span>
        </div>
        <div class="network-desc fade-in">
          <p>{{ t('aboutus.networkDesc') }}</p>
        </div>
      </div>
    </section>

    <!-- Philosophy -->
    <section id="philosophy" class="philosophy-section">
      <div class="qs-container">
        <div class="section-header fade-in">
          <h2>{{ t('aboutus.philosophyTitle') }}</h2>
          <div class="divider"></div>
        </div>
        <div class="philosophy-content">
          <div class="philosophy-quote fade-in">
            {{ t('aboutus.philosophyQuote') }}
          </div>
          <p class="philosophy-text fade-in">
            {{ t('aboutus.philosophyText') }}
          </p>
          <div class="values-grid fade-in">
            <div class="value-item">
              <div class="value-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <h4>{{ t('aboutus.valueClient') }}</h4>
              <p>{{ t('aboutus.valueClientDesc') }}</p>
            </div>
            <div class="value-item">
              <div class="value-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <h4>{{ t('aboutus.valueProfessional') }}</h4>
              <p>{{ t('aboutus.valueProfessionalDesc') }}</p>
            </div>
            <div class="value-item">
              <div class="value-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
              <h4>{{ t('aboutus.valueDiligence') }}</h4>
              <p>{{ t('aboutus.valueDiligenceDesc') }}</p>
            </div>
            <div class="value-item">
              <div class="value-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                  <path d="M9 18h6"/>
                  <path d="M10 22h4"/>
                  <path d="M12 2v2"/>
                </svg>
              </div>
              <h4>{{ t('aboutus.valueInnovation') }}</h4>
              <p>{{ t('aboutus.valueInnovationDesc') }}</p>
            </div>
            <div class="value-item">
              <div class="value-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m11 17 2 2a1 1 0 0 0 1.4 0l3.2-3.2a1 1 0 0 0 0-1.4l-1.4-1.4"/>
                  <path d="M13 13l2.5 2.5a1 1 0 0 0 1.4 0l1.4-1.4a1 1 0 0 0 0-1.4L16 10"/>
                  <path d="M16 10l-2.8-2.8a4 4 0 0 0-5.6 0L5 10a4 4 0 0 0 0 5.6l.7.7"/>
                  <path d="M14 22l-2-2"/>
                  <path d="M4 12l8-8"/>
                </svg>
              </div>
              <h4>{{ t('aboutus.valueCooperation') }}</h4>
              <p>{{ t('aboutus.valueCooperationDesc') }}</p>
            </div>
          </div>
          <div class="philosophy-bottom-quote fade-in">
            <p>{{ t('aboutus.philosophyBottom') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ESG -->
    <section id="esg" class="esg-section">
      <div class="qs-container">
        <div class="esg-header fade-in">
          <div class="esg-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.77 10.22-10 10Z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
            <span>{{ t('aboutus.esgBadge') }}</span>
          </div>
          <h2>{{ t('aboutus.esgTitle') }}</h2>
          <p class="subtitle">{{ t('aboutus.esgSubtitle') }}</p>
        </div>
        <div class="esg-grid">
          <div class="esg-card fade-in">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.77 10.22-10 10Z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
              {{ t('aboutus.esgEnv') }}
            </h3>
            <p>{{ t('aboutus.esgEnvDesc') }}</p>
          </div>
          <div class="esg-card fade-in">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              {{ t('aboutus.esgSocial') }}
            </h3>
            <p>{{ t('aboutus.esgSocialDesc') }}</p>
          </div>
          <div class="esg-card fade-in">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 22V10l6-6 6 6v12"/>
                <path d="M6 10h12"/>
                <path d="M10 22v-6h4v6"/>
              </svg>
              {{ t('aboutus.esgGov') }}
            </h3>
            <p>{{ t('aboutus.esgGovDesc') }}</p>
          </div>
        </div>
        <div class="esg-footer fade-in">
          <p>{{ t('aboutus.esgFooter') }}</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="qs-container">
        <h2>{{ t('aboutus.ctaTitle') }}</h2>
        <p>{{ t('aboutus.ctaDesc') }}</p>
        <button type="button" class="cta-btn" onclick="alert('Contact feature coming soon')">{{ t('aboutus.ctaBtn') }}</button>
      </div>
    </section>
  </div>
</template>

<style scoped src="./style.css"></style>
