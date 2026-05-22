<script setup lang="ts">
interface Props {
  image?: string
  height?: string
}

withDefaults(defineProps<Props>(), {
  image: '/images/attorney/attorney-header.png',
  height: '55vh',
})
</script>

<template>
  <section
    class="page-hero"
    :style="{
      backgroundImage: image
        ? `linear-gradient(180deg, rgba(6,47,53,0.32), rgba(6,47,53,0.52)), url(${image})`
        : `linear-gradient(180deg, rgba(6,47,53,0.32), rgba(6,47,53,0.52))`,
      height,
    }"
  />
</template>

<style scoped>
.page-hero {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 0;
  background-size: cover;
  background-position: center;
}
</style>
