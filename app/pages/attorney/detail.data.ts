/**
 * 律师详情页数据类型
 */

import type { Lawyer } from './data'

/** 律师详细资料（一对一扩展） */
export interface AttorneyProfile {
  resume: string
  representative_cases: string
  education: string
  qualifications: string
  work_experience: string
  awards: string
  other: string
}

/** 律师详情 = 基础信息 + 详细资料 */
export type LawyerDetail = Lawyer & {
  profile?: AttorneyProfile
}

/** 详情页侧边栏导航项 */
export interface DetailNavItem {
  key: string
  i18nKey: string
}

export const getDetailNavItems = (): DetailNavItem[] => [
  { key: 'resume', i18nKey: 'attorney.detailResume' },
  { key: 'representative_cases', i18nKey: 'attorney.detailCases' },
  { key: 'education', i18nKey: 'attorney.detailEducation' },
  { key: 'qualifications', i18nKey: 'attorney.detailQualifications' },
  { key: 'work_experience', i18nKey: 'attorney.detailWorkExp' },
  { key: 'awards', i18nKey: 'attorney.detailAwards' },
]

export function render_markdown(content: string | undefined | null): string {
  if (!content) return ''
  
  let html = content
    // 加粗 **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // 斜体 *text*
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 标题
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // 引用
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    // 列表项
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    // 链接 [text](url)
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
  
  // 把连续的 <li> 包进 <ul>
  html = html.replace(/(<li>.*?<<\/li>)\n?(<li>.*?<<\/li>)/gs, '<ul>$1$2</ul>')
  
  // 段落处理
  const paragraphs = html.split(/\n\n+/).map(p => {
    if (p.trim().startsWith('<h') || p.trim().startsWith('<ul') || p.trim().startsWith('<blockquote')) {
      return p
    }
    return `<p>${p.replace(/\n/g, '<br>')}</p>`
  })
  
  return paragraphs.join('\n')
}
