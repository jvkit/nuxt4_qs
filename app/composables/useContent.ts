import { computed } from 'vue'
import { useLocale } from './useLocale'

/**
 * 多语言内容加载器
 * 输入带有 translations 字段的数据数组，自动根据当前语言返回对应版本
 *
 * 数据结构：
 * {
 *   id: 1,
 *   slug: 'article-001',
 *   date: '2024-03-15',
 *   translations: {
 *     zh: { title: '...', lead: '...' },
 *     en: { title: '...', lead: '...' }
 *   }
 * }
 */
export interface TranslatableItem {
  translations: Record<string, Record<string, any>>
  [key: string]: any
}

export function useContent<T extends TranslatableItem>(data: T[]) {
  const { locale } = useLocale()

  return computed(() =>
    data.map((item) => {
      const tr = item.translations[locale.value] || item.translations['zh'] || {}
      const { translations, ...rest } = item
      return { ...rest, ...tr } as Omit<T, 'translations'> & Record<string, any>
    })
  )
}

/**
 * 单条内容加载（用于详情页）
 */
export function useContentItem<T extends TranslatableItem>(
  data: T[],
  matcher: (item: T) => boolean
) {
  const { locale } = useLocale()

  return computed(() => {
    const item = data.find(matcher)
    if (!item) return null

    const tr = item.translations[locale.value] || item.translations['zh'] || {}
    const { translations, ...rest } = item
    return { ...rest, ...tr } as Omit<T, 'translations'> & Record<string, any>
  })
}
