import { ref, computed } from 'vue'
import { zh } from '~/locales/zh'
import { en } from '~/locales/en'

export type Locale = 'zh' | 'en'

const messages = { zh, en } as const

const locale = ref<Locale>('zh')

export function useLocale() {
  const t = computed(() => {
    return (key: string): string => {
      const keys = key.split('.')
      let value: any = messages[locale.value]
      for (const k of keys) {
        value = value?.[k]
      }
      return typeof value === 'string' ? value : key
    }
  })

  const setLocale = (l: Locale) => {
    locale.value = l
    if (process.client) {
      document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en'
    }
  }

  return { locale, t, setLocale }
}
