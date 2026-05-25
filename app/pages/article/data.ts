export interface ArticleBlock {
  type: 'h2' | 'h3' | 'h4' | 'p' | 'law' | 'case' | 'viewpoint' | 'list-item'
  text?: string
  title?: string
  content?: string
  badge?: string
  caseId?: string
}

export interface ArticleTranslation {
  title: string
  subtitle?: string
  lead: string
  meta: Record<string, string>
  blocks: ArticleBlock[]
  conclusion?: string
  references: string[]
}

export interface ArticleRaw {
  id: number
  slug: string
  date: string
  tags: string[]
  translations: Record<string, ArticleTranslation>
}

export interface Article extends ArticleTranslation {
  id: number
  slug: string
  date: string
  tags: string[]
}
