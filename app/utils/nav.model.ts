export type NavLink = {
  type: 'link'
  label: string
  href: string
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
}

export type NavDropdown = {
  type: 'dropdown'
  label: string
  href: string
  groups: { title?: string; links: NavLink[] }[]
  topLink?: NavLink
}

export type NavItem = NavLink | NavMegaMenu | NavDropdown

export const headerNavItems: NavItem[] = [
  { type: 'link', label: '专业人员', href: '/attorney' },
  { type: 'link', label: '专业领域', href: '/practice-areas' },
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
    groups: [
      {
        links: [
          { type: 'link', label: '专业文章', href: '/article' },
          { type: 'link', label: '法律法规', href: '/the-firm/news-events/#byNewsType=1753' },
          { type: 'link', label: '青颂里程碑', href: '/the-firm/news-events/#byNewsType=1753' },
        ],
      },
    ],
  },
  { type: 'link', label: 'AI支持', href: 'https://ai.qs-legal.com/' },
  { type: 'link', label: '关于我们', href: '/aboutus' },
]
