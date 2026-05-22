import heroConfig from '~/config/hero.config.json'

export interface HeroConfig {
  image?: string
  height?: string
}

export function useHero() {
  const route = useRoute()

  const defaultHero = {
    show: true,
    height: '55vh',
    image: '/images/attorney/attorney-header.png',
  }

  const hero = computed(() => {
    const name = route.name as string
    const config = (heroConfig as Record<string, HeroConfig>)[name]
    if (!config) return { show: false }

    return {
      show: true,
      image: config.image || defaultHero.image,
      height: config.height || defaultHero.height,
    }
  })

  return { hero }
}
