/**
 * data.ts
 * ============
 * 律师数据类型定义
 * 数据由前端静态 JSON 提供 (/attorneys/data.json)
 */

/** 律师专业领域 */
export interface PracticeArea {
  /** 领域名称，如 "公司法" */
  name: string
}

/** 律师详细资料 */
export interface AttorneyProfile {
  resume: string
  representative_cases: string
  education: string
  qualifications: string
  work_experience: string
  awards: string
  other: string
}

/** 律师单条数据模型 */
export interface Lawyer {
  /** 唯一标识（来自数据库主键） */
  id: number
  /** 姓名 */
  name: string
  /** 英文名 */
  name_en?: string
  /** 头像图片路径 */
  avatar: string
  /** 头像图片路径（旧字段兼容） */
  image_url?: string
  /** 职位/头衔 */
  title: string
  /** 英文职位 */
  title_en?: string
  /** 办公室地点 */
  office: string
  /** 英文办公室 */
  office_en?: string
  /** 专业领域列表 */
  practice_areas: PracticeArea[]
  /** 个人简介 */
  bio: string
  /** 英文简介 */
  bio_en?: string
  /** 邮箱 */
  email: string
  /** 电话 */
  phone: string
  /** 是否为重点推荐（用于样式区分） */
  featured?: boolean
  /** 排序权重 */
  sort_order: number
  /** 是否启用 */
  is_active: boolean
  /** 创建时间 */
  created_at: string
  /** 更新时间 */
  updated_at: string
  /** 详细资料 */
  profile?: AttorneyProfile
  /** 英文详细资料 */
  profile_en?: AttorneyProfile
}
