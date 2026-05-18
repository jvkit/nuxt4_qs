<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { NavItem, NavMegaMenu, NavDropdown } from '~/utils/nav.model'
import { useLocale } from '~/composables/useLocale'

const props = defineProps<{ item: NavItem }>()

const { t } = useLocale()

function translateLabel(label: string, i18nKey?: string) {
  return t.value(i18nKey || label)
}

const practiceLinks = ref<{ label: string; href: string }[]>([])

function isMega(item: NavItem): item is NavMegaMenu {
  return item.type === 'mega'
}

function isDropdown(item: NavItem): item is NavDropdown {
  return item.type === 'dropdown'
}

function loadPracticeLinks() {
  // TODO: 从后端加载执业领域数据
  practiceLinks.value = []
}

onMounted(() => {
  if (isMega(props.item) && props.item.label === '专业领域') {
    loadPracticeLinks()
  }
})

function refresh() {
  if (isMega(props.item) && props.item.label === '专业领域') {
    loadPracticeLinks()
  }
}

defineExpose({ refresh })
</script>

<template>
  <div v-if="isMega(item) && item.label === '专业领域'" class="megaMenu">
    <div class="megaInner">
      <div class="megaCol">
        <ul class="megaList">
          <li v-for="link in practiceLinks" :key="link.href">
            <NuxtLink :to="link.href">{{ translateLabel(link.label, link.i18nKey) }}</NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div v-else-if="isMega(item)" class="megaMenu">
    <div class="megaInner">
      <div v-for="(col, idx) in item.columns" :key="idx" class="megaCol">
        <h4 v-if="col.title" class="megaColTitle">{{ col.title }}</h4>
        <ul class="megaList">
          <li v-for="link in col.links" :key="link.href">
            <NuxtLink :to="link.href">{{ translateLabel(link.label, link.i18nKey) }}</NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div v-else-if="isDropdown(item)" class="megaMenu dropdownMenu">
    <div v-for="(group, gIdx) in item.groups" :key="gIdx" class="dropdownGroup">
      <h4 v-if="group.title" class="megaColTitle">{{ group.title }}</h4>
      <ul class="megaList">
        <li v-for="link in group.links" :key="link.href">
          <NuxtLink :to="link.href">{{ link.label }}</NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.megaMenu {
  background: #fff;
  border: 1px solid var(--qs-color-border);
  border-radius: var(--qs-radius);
  box-shadow: var(--qs-shadow);
  padding: 16px 20px;
  min-width: 260px;
}
.megaInner {
  display: flex;
  gap: 24px;
}
.megaCol {
  min-width: 180px;
}
.megaColTitle {
  font-size: 13px;
  font-weight: 600;
  color: var(--qs-color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--qs-color-border);
}
.megaList {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.megaList li a {
  display: block;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--qs-color-text);
  text-decoration: none;
  transition: all 0.2s;
}
.megaList li a:hover {
  background: var(--qs-color-bg);
  color: var(--qs-color-teal-900);
}
.dropdownMenu {
  min-width: 200px;
}
.dropdownGroup + .dropdownGroup {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--qs-color-border);
}

/* 移动端适配 */
@media (max-width: 992px) {
  .megaMenu {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: none;
    color: #fff;
  }
  .megaColTitle {
    color: rgba(255, 255, 255, 0.5);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
  .megaList li a {
    color: rgba(255, 255, 255, 0.85);
    padding: 10px 12px;
  }
  .megaList li a:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
  }
}
</style>
