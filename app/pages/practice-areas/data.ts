export interface PracticeRaw {
  slug: string
  translations: Record<string, {
    name: string
    overview: string[]
    cases: string[]
    services: string[]
  }>
}

export { default as practicesRaw } from './practices.json'
