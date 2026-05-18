export type NavLink = {
  type: 'link'
  label: string
  href: string
  i18nKey?: string
}

export type NavMegaMenuColumn = {
  title?: string
  links: NavLink[]
}

export type NavMegaMenu = {
  type: 'mega'
  label: string
  href: string
  columns: NavMegaMenuColumn[]
  topLink?: NavLink
  i18nKey?: string
}

export type NavDropdown = {
  type: 'dropdown'
  label: string
  href: string
  groups: { title?: string; links: NavLink[] }[]
  topLink?: NavLink
  i18nKey?: string
}

export type NavItem = NavLink | NavMegaMenu | NavDropdown

export const headerNavItems: NavItem[] = [
  { type: 'link', label: '专业人员', href: '/attorney', i18nKey: 'nav.attorneys' },
  { type: 'link', label: '专业领域', href: '/practice-areas', i18nKey: 'nav.practiceAreas' },
  // {
  //   type: 'mega',
  //   label: '专业领域',
  //   href: '/practice-areas',
  //   columns: [],
  // },
  {
    type: 'dropdown',
    label: '消息',
    href: '/the-firm/news-events/',
    i18nKey: 'nav.news',
    groups: [
      {
        links: [
          { type: 'link', label: '专业文章', href: '/article', i18nKey: 'nav.articles' },
          { type: 'link', label: '法律法规', href: '/the-firm/news-events/#byNewsType=1753', i18nKey: 'nav.regulations' },
          { type: 'link', label: '青颂里程碑', href: '/the-firm/news-events/#byNewsType=1753', i18nKey: 'nav.milestones' },
        ],
      },
    ],
  },
  { type: 'link', label: 'AI支持', href: 'https://ai.qs-legal.com/', i18nKey: 'nav.aiSupport' },
  { type: 'link', label: '关于我们', href: '/aboutus', i18nKey: 'nav.aboutUs' },
]
