<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import type { NavItem } from '~/utils/nav.model'
import { headerNavItems } from '~/utils/nav.model'
import { useLocale } from '~/composables/useLocale'

const openKey = ref<string | null>(null)
const mobileOpen = ref(false)
const closeTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const { locale, t, setLocale } = useLocale()

const items = computed(() => headerNavItems)

function keyOf(item: NavItem) {
  return `${item.type}:${item.label}`
}

function translateLabel(item: NavItem) {
  return t.value(item.i18nKey || item.label)
}

function open(item: NavItem) {
  if (item.type === 'link') return
  if (closeTimer.value) {
    clearTimeout(closeTimer.value)
    closeTimer.value = null
  }
  openKey.value = keyOf(item)
}

function close(item?: NavItem) {
  closeTimer.value = setTimeout(() => {
    if (!item) {
      openKey.value = null
      return
    }
    if (openKey.value === keyOf(item)) openKey.value = null
  }, 1000)
}

/* ---------- 移动端菜单 ---------- */
function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
  if (!mobileOpen.value) {
    openKey.value = null
    document.body.style.overflow = ''
    document.removeEventListener('click', onDocClick)
  } else {
    document.body.style.overflow = 'hidden'
    nextTick(() => setTimeout(() => document.addEventListener('click', onDocClick), 0))
  }
}

function closeMobile() {
  mobileOpen.value = false
  openKey.value = null
  document.body.style.overflow = ''
  document.removeEventListener('click', onDocClick)
}

function onDocClick(e: MouseEvent) {
  const header = document.querySelector('.navHeader')
  if (header && !header.contains(e.target as Node)) {
    closeMobile()
  }
}

function onLinkClick() {
  closeMobile()
}

/* ---------- 滚动检测 ---------- */
const isTop = ref(true)
function onScroll() {
  isTop.value = window.scrollY <= 10
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('click', onDocClick)
  document.body.style.overflow = ''
})

/* ---------- 搜索 ---------- */
const topSearch = ref('')
function submitTopSearch() {
  const q = topSearch.value.trim()
  if (!q) return
  window.location.hash = `#search?q=${encodeURIComponent(q)}`
}
</script>

<template>
  <header class="navHeader" :class="{ isTop }" @mouseleave="close()">
    <div class="qs-container navInner">
      <NuxtLink class="brand" to="/" aria-label="返回首页">
        <span class="brandMark">{{ t('nav.brand') }}</span>
      </NuxtLink>

      <!-- 汉堡按钮 -->
      <button
        class="burger"
        type="button"
        :class="{ isOpen: mobileOpen }"
        @click="toggleMobile"
        aria-label="切换菜单"
      >
        <span />
        <span />
        <span />
      </button>

      <!-- 移动端遮罩 -->
      <div class="navBackdrop" :class="{ isOpen: mobileOpen }" @click="closeMobile" />

      <nav class="nav" :class="{ isOpen: mobileOpen }" aria-label="主导航">
        <!-- 移动端关闭按钮 -->
        <button class="navClose" type="button" @click="closeMobile" aria-label="关闭菜单">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <ul class="navList">
          <li
            v-for="item in items"
            :key="keyOf(item)"
            class="navItem"
            :class="{ hasMenu: item.type !== 'link', isOpen: openKey === keyOf(item) }"
            @mouseenter="open(item)"
          >
            <a
              v-if="item.type === 'link' && item.href.startsWith('http')"
              class="navLink"
              :href="item.href"
              target="_blank"
              rel="noopener noreferrer"
              @click="onLinkClick"
            >
              <span>{{ translateLabel(item) }}</span>
            </a>
            <NuxtLink
              v-else-if="item.type === 'link'"
              class="navLink"
              :to="item.href"
              @click="onLinkClick"
            >
              <span>{{ translateLabel(item) }}</span>
            </NuxtLink>
            <button
              v-else
              class="navLink navLinkBtn"
              :class="{ isOpen: openKey === keyOf(item) }"
              @click="openKey = openKey === keyOf(item) ? null : keyOf(item)"
            >
              <span>{{ translateLabel(item) }}</span>
              <svg
                class="chev"
                :class="{ isOpen: openKey === keyOf(item) }"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            <div v-if="item.type !== 'link'" class="menuWrap" @mouseleave="close(item)">
              <MegaMenu :item="item" />
            </div>
          </li>

          <!-- 语言切换 — 放在关于我们右侧 -->
          <li class="navItem langSwitchItem">
            <div class="langSwitch">
              <button
                class="langBtn"
                :class="{ active: locale === 'zh' }"
                @click="setLocale('zh')"
              >
                {{ t('lang.zh') }}
              </button>
              <span class="langDivider">|</span>
              <button
                class="langBtn"
                :class="{ active: locale === 'en' }"
                @click="setLocale('en')"
              >
                {{ t('lang.en') }}
              </button>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>
/* ====== 基础 / 桌面端 ====== */
.navHeader {
  position: fixed;
  top: 0;
  inset-inline: 0;
  height: var(--qs-nav-height);
  z-index: 50;
  background: rgb(9, 34, 27);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: background 0.35s ease, backdrop-filter 0.35s ease, border-color 0.35s ease;
}
.navHeader.isTop {
  background: transparent;
  backdrop-filter: none;
  border-bottom-color: transparent;
}
.navInner {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 18px;
}
.brand {
  display: inline-flex;
  align-items: center;
  height: 100%;
  padding: 0 8px;
  color: #fff;
}
.brandMark {
  font-weight: 700;
  letter-spacing: 0.12em;
}

/* 汉堡按钮 */
.burger {
  display: none;
  width: 48px;
  height: 48px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  background: transparent;
  padding: 12px;
  cursor: pointer;
  position: relative;
  z-index: 55;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.burger span {
  display: block;
  width: 22px;
  height: 2px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 2px;
  transition: all 0.3s ease;
}
.burger span + span {
  margin-top: 5px;
}
.burger.isOpen span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.burger.isOpen span:nth-child(2) {
  opacity: 0;
}
.burger.isOpen span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* 桌面导航 */
.nav {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 18px;
  justify-content: flex-end;
  align-self: stretch;
}
.navBackdrop {
  display: none;
}
.navClose {
  display: none;
}
.navList {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  gap: 10px;
  align-items: center;
  height: 100%;
}
.navItem {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}
.navLink {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  white-space: nowrap;
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
}
.navLinkBtn {
  width: 100%;
  justify-content: space-between;
}
.navItem.hasMenu .navLink:hover,
.navItem.isOpen .navLink {
  background: rgba(51, 157, 238, 0.925);
}
.chev {
  transition: transform 0.25s ease;
  flex-shrink: 0;
}
.chev.isOpen {
  transform: rotate(180deg);
}
.menuWrap {
  position: absolute;
  left: 0;
  top: var(--qs-nav-height);
  width: 30vw;
  min-width: 320px;
  max-width: 480px;
  display: none;
  margin-top: -12px;
  padding-top: 12px;
}
.navItem.isOpen .menuWrap {
  display: block;
}
/* 语言切换 */
.langSwitchItem {
  margin-left: 16px;
  padding-left: 16px;
  border-left: 1px solid rgba(255, 255, 255, 0.12);
}
.langSwitch {
  display: flex;
  align-items: center;
  gap: 8px;
}
.langBtn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.6);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  min-width: 36px;
  text-align: center;
}
.langBtn:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.08);
}
.langBtn.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.45);
}
.langDivider {
  color: rgba(255, 255, 255, 0.25);
  font-size: 14px;
}

/* ====== 移动端 (< 992px) ====== */
@media (max-width: 992px) {
  .burger {
    display: inline-flex;
    z-index: 100;
  }
  .langSwitchItem {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }
  .langSwitch {
    margin-left: 0;
    margin-right: 8px;
  }

  /* 遮罩层 */
  .navBackdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 50;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
  }
  .navBackdrop.isOpen {
    opacity: 1;
    visibility: visible;
  }

  /* 抽屉菜单 */
  .nav {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    height: 100dvh;
    width: 280px;
    max-width: 80vw;
    background: rgb(9, 34, 27);
    padding: 56px 16px 20px;
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    justify-content: flex-start;
    overflow-y: auto;
    flex: none;
    transform: translateX(100%);
    transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1), visibility 0.35s;
    z-index: 52;
    gap: 0;
    box-shadow: -10px 0 40px rgba(0, 0, 0, 0.35);
    border-left: 1px solid rgba(255, 255, 255, 0.06);
    pointer-events: none;
    visibility: hidden;
  }
  .nav.isOpen {
    transform: translateX(0);
    pointer-events: auto;
    visibility: visible;
  }

  /* 关闭按钮 */
  .navClose {
    display: flex;
    position: absolute;
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    border-radius: 8px;
  }
  .navClose:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
  }

  /* 菜单列表 */
  .navList {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    gap: 2px;
    height: auto;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
  .navItem {
    position: static;
    height: auto;
    flex-direction: column;
    align-items: stretch;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  .navItem:last-child {
    border-bottom: none;
  }
  .navLink {
    padding: 14px 10px;
    font-size: 15px;
    border-radius: 8px;
    width: 100%;
    justify-content: flex-start;
  }
  .navLink:hover,
  .navItem.isOpen .navLink {
    background: rgba(255, 255, 255, 0.06);
  }

  /* 子菜单 */
  .menuWrap {
    position: static;
    display: none;
    margin-top: 0;
    padding-top: 0;
    width: 100%;
    min-width: auto;
    max-width: none;
    padding-left: 8px;
    padding-bottom: 8px;
  }
  .navItem.isOpen .menuWrap {
    display: block;
  }

  /* 搜索 */
  .topSearch {
    width: 100%;
    margin-top: 16px;
  }
  .topSearchInput {
    padding: 12px 14px;
    font-size: 16px;
  }
}
</style>
