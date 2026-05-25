<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  href?: string
}

const props = defineProps<{
  items: BreadcrumbItem[]
}>()

// 注入 BreadcrumbList Schema
useSchemaOrg(() =>
  props.items.length
    ? [
        defineBreadcrumb({
          itemListElement: props.items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.label,
            item: item.href
              ? 'https://www.qs-legal.com' + item.href
              : undefined,
          })),
        }),
      ]
    : [],
)
</script>

<template>
  <nav aria-label="面包屑导航" class="breadcrumb">
    <ol class="breadcrumb__list">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="breadcrumb__item"
      >
        <NuxtLink
          v-if="item.href && index < items.length - 1"
          :to="item.href"
          class="breadcrumb__link"
        >
          {{ item.label }}
        </NuxtLink>
        <span v-else class="breadcrumb__current">{{ item.label }}</span>
        <span v-if="index < items.length - 1" class="breadcrumb__sep">/</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb {
  padding: 8px 0;
  font-size: 14px;
}
.breadcrumb__list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  list-style: none;
  padding: 0;
  margin: 0;
}
.breadcrumb__link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: color 0.2s;
}
.breadcrumb__link:hover {
  color: #fff;
  text-decoration: underline;
}
.breadcrumb__current {
  color: rgba(255, 255, 255, 0.6);
}
.breadcrumb__sep {
  color: rgba(255, 255, 255, 0.4);
  margin-left: 4px;
}
</style>
