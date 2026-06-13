<script setup lang="ts">
import type { ArticleRaw } from '~/pages/article/data'

definePageMeta({ layout: false })

const password = ref('')
const isLoggedIn = ref(false)
const loading = ref(false)
const uploading = ref(false)
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const activeTab = ref<'articles' | 'practice-areas' | 'attorneys'>('articles')

const CORRECT_PASSWORD = 'qsong2024'

// 文章
const { data: articlesRaw, refresh: refreshArticles } = await useFetch<ArticleRaw[]>('/api/articles')
const articles = computed(() => articlesRaw.value || [])

// 执业领域
interface PracticeAreaRaw {
  slug: string
  translations: Record<string, { name: string; overview: string[]; cases: string[]; services: string[] }>
}
const { data: paRaw, refresh: refreshPA } = await useFetch<PracticeAreaRaw[]>('/api/practice-areas')
const practiceAreas = computed(() => paRaw.value || [])

// 律师
interface AttorneyRaw {
  id: number
  name: string
  name_en?: string
  title: string
  title_en?: string
  office: string
  office_en?: string
  practice_areas?: { name: string }[]
  avatar: string
  email: string
  phone: string
  bio: string
  bio_en?: string
  featured: boolean
  sort_order: number
  is_active: boolean
  profile?: Record<string, string>
  profile_en?: Record<string, string>
}
const { data: attRaw, refresh: refreshAtt } = await useFetch<AttorneyRaw[]>('/api/attorneys')
const attorneys = computed(() => attRaw.value || [])

function checkLogin() {
  const saved = localStorage.getItem('admin_logged_in')
  if (saved === 'true') isLoggedIn.value = true
}

function login() {
  if (password.value === CORRECT_PASSWORD) {
    isLoggedIn.value = true
    localStorage.setItem('admin_logged_in', 'true')
  } else {
    alert('密码错误')
  }
}

function logout() {
  isLoggedIn.value = false
  localStorage.removeItem('admin_logged_in')
}

/* ================================
   文章操作
   ================================ */
async function deleteArticle(slug: string) {
  if (!confirm(`确定删除文章 ${slug}？`)) return
  try {
    await $fetch(`/api/articles/${slug}`, { method: 'DELETE' })
    alert('删除成功')
    await refreshArticles()
  } catch (e: any) {
    alert('删除失败: ' + (e.statusMessage || e.message || '未知错误'))
    console.error(e)
  }
}

async function translateArticle(slug: string) {
  if (!confirm(`确定翻译文章 ${slug}？`)) return
  loading.value = true
  try {
    const res = await $fetch<{ success: boolean; message?: string }>(`/api/articles/${slug}/translate`, { method: 'POST' })
    alert(res.message || '翻译完成！')
    await refreshArticles()
  } catch (e: any) {
    alert('翻译失败: ' + (e.message || '未知错误'))
  }
  loading.value = false
}

/* ================================
   执业领域操作
   ================================ */
const showPAModal = ref(false)
const editingPA = ref(false)
const paForm = reactive({
  slug: '',
  translations: {
    zh: { name: '', overview: '', cases: '', services: '' },
    en: { name: '', overview: '', cases: '', services: '' },
  },
})

function resetPAForm() {
  paForm.slug = ''
  paForm.translations.zh = { name: '', overview: '', cases: '', services: '' }
  paForm.translations.en = { name: '', overview: '', cases: '', services: '' }
}

function openPANew() {
  editingPA.value = false
  resetPAForm()
  showPAModal.value = true
}

function openPAEdit(p: PracticeAreaRaw) {
  editingPA.value = true
  paForm.slug = p.slug
  const zh = p.translations?.zh || { name: '', overview: [], cases: [], services: [] }
  const en = p.translations?.en || { name: '', overview: [], cases: [], services: [] }
  paForm.translations.zh = {
    name: zh.name || '',
    overview: (zh.overview || []).join('\n'),
    cases: (zh.cases || []).join('\n'),
    services: (zh.services || []).join('\n'),
  }
  paForm.translations.en = {
    name: en.name || '',
    overview: (en.overview || []).join('\n'),
    cases: (en.cases || []).join('\n'),
    services: (en.services || []).join('\n'),
  }
  showPAModal.value = true
}

function buildPAData() {
  return {
    slug: paForm.slug,
    translations: {
      zh: {
        name: paForm.translations.zh.name,
        overview: paForm.translations.zh.overview.split('\n').map(s => s.trim()).filter(Boolean),
        cases: paForm.translations.zh.cases.split('\n').map(s => s.trim()).filter(Boolean),
        services: paForm.translations.zh.services.split('\n').map(s => s.trim()).filter(Boolean),
      },
      en: {
        name: paForm.translations.en.name,
        overview: paForm.translations.en.overview.split('\n').map(s => s.trim()).filter(Boolean),
        cases: paForm.translations.en.cases.split('\n').map(s => s.trim()).filter(Boolean),
        services: paForm.translations.en.services.split('\n').map(s => s.trim()).filter(Boolean),
      },
    },
  }
}

async function savePA() {
  if (!paForm.slug) { alert('Slug 不能为空'); return }
  if (!paForm.translations.zh.name) { alert('中文名称不能为空'); return }
  loading.value = true
  const data = buildPAData()
  const url = editingPA.value ? `/api/practice-areas/${paForm.slug}` : '/api/practice-areas'
  const method = editingPA.value ? 'PUT' : 'POST'
  try {
    await $fetch(url, { method, body: data })
    alert('保存成功')
    showPAModal.value = false
    await refreshPA()
  } catch (e: any) {
    alert('保存失败: ' + (e.statusMessage || e.message || '未知错误'))
  }
  loading.value = false
}

async function deletePA(slug: string) {
  if (!confirm(`确定删除执业领域 ${slug}？`)) return
  try {
    await $fetch(`/api/practice-areas/${slug}`, { method: 'DELETE' })
    alert('删除成功')
    await refreshPA()
  } catch (e: any) {
    alert('删除失败: ' + (e.statusMessage || e.message || '未知错误'))
  }
}

async function translatePracticeArea(slug: string) {
  if (!confirm(`确定翻译执业领域 ${slug}？`)) return
  loading.value = true
  try {
    const res = await $fetch<{ success: boolean; message?: string }>(`/api/practice-areas/${slug}/translate`, { method: 'POST' })
    alert(res.message || '翻译完成！')
    await refreshPA()
  } catch (e: any) {
    alert('翻译失败: ' + e.message)
  }
  loading.value = false
}

/* ================================
   律师操作
   ================================ */
const showAttModal = ref(false)
const editingAtt = ref(false)
const attForm = reactive({
  id: 0,
  name: '',
  name_en: '',
  title: '',
  title_en: '',
  office: '',
  office_en: '',
  email: '',
  phone: '',
  avatar: '',
  bio: '',
  bio_en: '',
  featured: false,
  sort_order: 0,
  is_active: true,
  practice_areas: '',
  profile: { resume: '', representative_cases: '', education: '', qualifications: '', work_experience: '', awards: '', other: '' },
  profile_en: { resume: '', representative_cases: '', education: '', qualifications: '', work_experience: '', awards: '', other: '' },
})
const attAvatarInput = ref<HTMLInputElement | null>(null)
const attAvatarUploading = ref(false)

function resetAttForm() {
  attForm.id = 0
  attForm.name = ''
  attForm.name_en = ''
  attForm.title = ''
  attForm.title_en = ''
  attForm.office = ''
  attForm.office_en = ''
  attForm.email = ''
  attForm.phone = ''
  attForm.avatar = ''
  attForm.bio = ''
  attForm.bio_en = ''
  attForm.featured = false
  attForm.sort_order = 0
  attForm.is_active = true
  attForm.practice_areas = ''
  attForm.profile = { resume: '', representative_cases: '', education: '', qualifications: '', work_experience: '', awards: '', other: '' }
  attForm.profile_en = { resume: '', representative_cases: '', education: '', qualifications: '', work_experience: '', awards: '', other: '' }
}

function openAttNew() {
  editingAtt.value = false
  resetAttForm()
  showAttModal.value = true
}

function openAttEdit(a: AttorneyRaw) {
  editingAtt.value = true
  attForm.id = a.id
  attForm.name = a.name || ''
  attForm.name_en = a.name_en || ''
  attForm.title = a.title || ''
  attForm.title_en = a.title_en || ''
  attForm.office = a.office || ''
  attForm.office_en = a.office_en || ''
  attForm.email = a.email || ''
  attForm.phone = a.phone || ''
  attForm.avatar = a.avatar || ''
  attForm.bio = a.bio || ''
  attForm.bio_en = a.bio_en || ''
  attForm.featured = a.featured || false
  attForm.sort_order = a.sort_order || 0
  attForm.is_active = a.is_active !== false
  attForm.practice_areas = (a.practice_areas || []).map(p => p.name).join(', ')
  const p = a.profile || {}
  const pe = a.profile_en || {}
  attForm.profile = {
    resume: p.resume || '',
    representative_cases: p.representative_cases || '',
    education: p.education || '',
    qualifications: p.qualifications || '',
    work_experience: p.work_experience || '',
    awards: p.awards || '',
    other: p.other || '',
  }
  attForm.profile_en = {
    resume: pe.resume || '',
    representative_cases: pe.representative_cases || '',
    education: pe.education || '',
    qualifications: pe.qualifications || '',
    work_experience: pe.work_experience || '',
    awards: pe.awards || '',
    other: pe.other || '',
  }
  showAttModal.value = true
}

function buildAttData() {
  return {
    id: attForm.id,
    name: attForm.name,
    name_en: attForm.name_en,
    title: attForm.title,
    title_en: attForm.title_en,
    office: attForm.office,
    office_en: attForm.office_en,
    email: attForm.email,
    phone: attForm.phone,
    avatar: attForm.avatar,
    bio: attForm.bio,
    bio_en: attForm.bio_en,
    featured: attForm.featured,
    sort_order: attForm.sort_order,
    is_active: attForm.is_active,
    practice_areas: attForm.practice_areas.split(',').map(s => s.trim()).filter(Boolean).map(name => ({ name })),
    profile: attForm.profile,
    profile_en: attForm.profile_en,
  }
}

async function saveAtt() {
  if (!attForm.name) { alert('姓名不能为空'); return }
  if (!attForm.id && !editingAtt.value) { alert('ID 不能为空'); return }
  loading.value = true
  const data = buildAttData()
  const url = editingAtt.value ? `/api/attorneys/${attForm.id}` : '/api/attorneys'
  const method = editingAtt.value ? 'PUT' : 'POST'
  try {
    await $fetch(url, { method, body: data })
    alert('保存成功')
    showAttModal.value = false
    await refreshAtt()
  } catch (e: any) {
    alert('保存失败: ' + (e.statusMessage || e.message || '未知错误'))
  }
  loading.value = false
}

async function deleteAtt(id: number) {
  if (!confirm(`确定删除律师 ${id}？`)) return
  try {
    await $fetch(`/api/attorneys/${id}`, { method: 'DELETE' })
    alert('删除成功')
    await refreshAtt()
  } catch (e: any) {
    alert('删除失败: ' + (e.statusMessage || e.message || '未知错误'))
  }
}

async function translateAttorney(id: number) {
  if (!confirm(`确定翻译律师 ${id}？`)) return
  loading.value = true
  try {
    const res = await $fetch<{ success: boolean; message?: string }>(`/api/attorneys/${id}/translate`, { method: 'POST' })
    alert(res.message || '翻译完成！')
    await refreshAtt()
  } catch (e: any) {
    alert('翻译失败: ' + e.message)
  }
  loading.value = false
}

/* ================================
   头像上传
   ================================ */
function triggerAttAvatarSelect() {
  attAvatarInput.value?.click()
}

async function onAttAvatarSelected(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  const file = files[0]
  attAvatarUploading.value = true
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await $fetch<{ success: boolean; path: string }>('/api/upload/avatar', {
      method: 'POST',
      body: formData,
    })
    attForm.avatar = res.path
    alert('头像上传成功')
  } catch (e: any) {
    alert('头像上传失败: ' + (e.message || '未知错误'))
  }
  attAvatarUploading.value = false
  ;(e.target as HTMLInputElement).value = ''
}

/* ================================
   Word 上传
   ================================ */
function triggerFileInput() {
  fileInput.value?.click()
}

async function uploadFiles(files: FileList) {
  const docxFiles = Array.from(files).filter((f) => f.name.endsWith('.docx'))
  if (docxFiles.length === 0) {
    alert('请上传 .docx 格式')
    return
  }
  uploading.value = true
  const results: string[] = []
  for (const file of docxFiles) {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await $fetch<{ success: boolean; title: string }>('/api/upload/article', {
        method: 'POST',
        body: formData,
      })
      results.push(`✅ ${file.name} -> ${res.title}`)
    } catch (e: any) {
      results.push(`❌ ${file.name}: ${e.message || '失败'}`)
    }
  }
  uploading.value = false
  alert(results.join('\n'))
  await refreshArticles()
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files) uploadFiles(files)
}

function handleFileSelect(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files) uploadFiles(files)
}

onMounted(() => {
  checkLogin()
})
</script>

<template>
  <div class="admin-page">
    <div class="admin-container">
      <div v-if="!isLoggedIn" class="login-box">
        <h1>🔒 管理后台</h1>
        <input v-model="password" type="password" placeholder="请输入密码" @keyup.enter="login" />
        <button @click="login">进入</button>
      </div>

      <div v-else class="admin-panel">
        <div class="admin-header">
          <h1>📋 内容管理</h1>
          <div class="admin-actions">
            <div v-if="activeTab === 'articles'" class="upload-area" :class="{ dragging: isDragging }"
              @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop" @click="triggerFileInput">
              <input ref="fileInput" type="file" accept=".docx" multiple style="display: none"
                @change="handleFileSelect" />
              <span v-if="uploading">⏳ 转换中...</span>
              <span v-else>📁 拖拽 Word 上传</span>
            </div>
            <button v-if="activeTab === 'practice-areas'" class="btn-primary" @click="openPANew">➕ 新增执业领域</button>
            <button v-if="activeTab === 'attorneys'" class="btn-primary" @click="openAttNew">➕ 新增律师</button>
            <button class="btn-secondary" @click="logout">退出</button>
          </div>
        </div>

        <!-- Tab 切换 -->
        <div class="tabs">
          <button class="tab" :class="{ active: activeTab === 'articles' }" @click="activeTab = 'articles'">
            文章 ({{ articles.length }})
          </button>
          <button class="tab" :class="{ active: activeTab === 'practice-areas' }"
            @click="activeTab = 'practice-areas'">
            执业领域 ({{ practiceAreas.length }})
          </button>
          <button class="tab" :class="{ active: activeTab === 'attorneys' }" @click="activeTab = 'attorneys'">
            律师 ({{ attorneys.length }})
          </button>
        </div>

        <div v-if="loading" class="loading">处理中...</div>

        <!-- 文章列表 -->
        <table v-if="activeTab === 'articles'" class="article-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Slug</th>
              <th>标题</th>
              <th>英文</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in articles" :key="a.slug">
              <td>{{ a.id }}</td>
              <td>{{ a.slug }}</td>
              <td>{{ a.translations?.zh?.title || '-' }}</td>
              <td>{{ a.translations?.en?.title ? '✅' : '❌' }}</td>
              <td class="actions">
                <NuxtLink :to="`/admin/edit/${a.slug}`" class="link-edit">编辑</NuxtLink>
                <a :href="`/article/${a.slug}`" target="_blank" class="link-view">预览</a>
                <button class="link-translate" @click="translateArticle(a.slug)">翻译</button>
                <button class="link-delete" @click="deleteArticle(a.slug)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 执业领域列表 -->
        <table v-if="activeTab === 'practice-areas'" class="article-table">
          <thead>
            <tr>
              <th>Slug</th>
              <th>名称</th>
              <th>英文</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in practiceAreas" :key="p.slug">
              <td>{{ p.slug }}</td>
              <td>{{ p.translations?.zh?.name || '-' }}</td>
              <td>{{ p.translations?.en?.name ? '✅' : '❌' }}</td>
              <td class="actions">
                <button class="link-edit" @click="openPAEdit(p)">编辑</button>
                <a :href="`/practice-areas/${p.slug}`" target="_blank" class="link-view">预览</a>
                <button class="link-translate" @click="translatePracticeArea(p.slug)">翻译</button>
                <button class="link-delete" @click="deletePA(p.slug)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 律师列表 -->
        <table v-if="activeTab === 'attorneys'" class="article-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>姓名</th>
              <th>职位</th>
              <th>办公室</th>
              <th>英文</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in attorneys" :key="a.id">
              <td>{{ a.id }}</td>
              <td>{{ a.name }}</td>
              <td>{{ a.title }}</td>
              <td>{{ a.office }}</td>
              <td>{{ a.name_en ? '✅' : '❌' }}</td>
              <td class="actions">
                <button class="link-edit" @click="openAttEdit(a)">编辑</button>
                <a :href="`/attorney/${a.id}`" target="_blank" class="link-view">预览</a>
                <button class="link-translate" @click="translateAttorney(a.id)">翻译</button>
                <button class="link-delete" @click="deleteAtt(a.id)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ========== 执业领域编辑弹窗 ========== -->
    <div v-if="showPAModal" class="modal-overlay" @click="showPAModal = false">
      <div class="modal modal--wide" @click.stop>
        <div class="modal-header">
          <h3>{{ editingPA ? '编辑执业领域' : '新增执业领域' }}</h3>
          <button class="modal-close" @click="showPAModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-section">
            <h4>基本信息</h4>
            <label>Slug <input v-model="paForm.slug" type="text" placeholder="slug-identifier" :disabled="editingPA" /></label>
          </div>
          <div class="form-two-col">
            <div class="form-section">
              <h4>🇨🇳 中文</h4>
              <label>名称 <input v-model="paForm.translations.zh.name" type="text" /></label>
              <label>概述（每行一段）<textarea v-model="paForm.translations.zh.overview" rows="4" /></label>
              <label>代表性案例（每行一条）<textarea v-model="paForm.translations.zh.cases" rows="4" /></label>
              <label>法律服务内容（每行一条）<textarea v-model="paForm.translations.zh.services" rows="4" /></label>
            </div>
            <div class="form-section">
              <h4>🇺🇸 English</h4>
              <label>Name <input v-model="paForm.translations.en.name" type="text" /></label>
              <label>Overview (one paragraph per line)<textarea v-model="paForm.translations.en.overview" rows="4" /></label>
              <label>Cases (one per line)<textarea v-model="paForm.translations.en.cases" rows="4" /></label>
              <label>Services (one per line)<textarea v-model="paForm.translations.en.services" rows="4" /></label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-primary" @click="savePA">💾 保存</button>
          <button class="btn-secondary" @click="showPAModal = false">取消</button>
        </div>
      </div>
    </div>

    <!-- ========== 律师编辑弹窗 ========== -->
    <div v-if="showAttModal" class="modal-overlay" @click="showAttModal = false">
      <div class="modal modal--wide" @click.stop>
        <div class="modal-header">
          <h3>{{ editingAtt ? '编辑律师' : '新增律师' }}</h3>
          <button class="modal-close" @click="showAttModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-two-col">
            <div class="form-section">
              <h4>基本信息</h4>
              <label>ID <input v-model.number="attForm.id" type="number" :disabled="editingAtt" /></label>
              <label>姓名 <input v-model="attForm.name" type="text" /></label>
              <label>英文名 <input v-model="attForm.name_en" type="text" /></label>
              <label>职位 <input v-model="attForm.title" type="text" /></label>
              <label>职位(英) <input v-model="attForm.title_en" type="text" /></label>
              <label>办公室 <input v-model="attForm.office" type="text" /></label>
              <label>办公室(英) <input v-model="attForm.office_en" type="text" /></label>
              <label>邮箱 <input v-model="attForm.email" type="text" /></label>
              <label>电话 <input v-model="attForm.phone" type="text" /></label>
              <label>执业领域（逗号分隔）<input v-model="attForm.practice_areas" type="text" placeholder="商事争议解决, 执行, 涉外法律咨询" /></label>
              <div class="form-row-inline">
                <label><input v-model="attForm.featured" type="checkbox" /> 首页展示</label>
                <label><input v-model="attForm.is_active" type="checkbox" /> 在职</label>
                <label>排序 <input v-model.number="attForm.sort_order" type="number" style="width: 60px" /></label>
              </div>
            </div>
            <div class="form-section">
              <h4>头像</h4>
              <div class="avatar-upload">
                <img v-if="attForm.avatar" :src="attForm.avatar" class="avatar-preview" />
                <div v-else class="avatar-placeholder">暂无头像</div>
                <input ref="attAvatarInput" type="file" accept="image/*" style="display: none" @change="onAttAvatarSelected" />
                <button class="btn-secondary" :disabled="attAvatarUploading" @click="triggerAttAvatarSelect">
                  {{ attAvatarUploading ? '上传中...' : (attForm.avatar ? '更换头像' : '上传头像') }}
                </button>
              </div>
              <h4 style="margin-top: 16px">简介</h4>
              <label>中文简介<textarea v-model="attForm.bio" rows="4" /></label>
              <label>英文简介<textarea v-model="attForm.bio_en" rows="4" /></label>
            </div>
          </div>
          <div class="form-two-col">
            <div class="form-section">
              <h4>🇨🇳 中文 Profile</h4>
              <label>简历 <textarea v-model="attForm.profile.resume" rows="4" /></label>
              <label>代表性案例 <textarea v-model="attForm.profile.representative_cases" rows="4" /></label>
              <label>教育背景 <textarea v-model="attForm.profile.education" rows="3" /></label>
              <label>职业资格 <textarea v-model="attForm.profile.qualifications" rows="3" /></label>
              <label>工作经历 <textarea v-model="attForm.profile.work_experience" rows="3" /></label>
              <label>奖项及社会职务 <textarea v-model="attForm.profile.awards" rows="3" /></label>
              <label>其他 <textarea v-model="attForm.profile.other" rows="2" /></label>
            </div>
            <div class="form-section">
              <h4>🇺🇸 English Profile</h4>
              <label>Resume <textarea v-model="attForm.profile_en.resume" rows="4" /></label>
              <label>Representative Cases <textarea v-model="attForm.profile_en.representative_cases" rows="4" /></label>
              <label>Education <textarea v-model="attForm.profile_en.education" rows="3" /></label>
              <label>Qualifications <textarea v-model="attForm.profile_en.qualifications" rows="3" /></label>
              <label>Work Experience <textarea v-model="attForm.profile_en.work_experience" rows="3" /></label>
              <label>Awards & Positions <textarea v-model="attForm.profile_en.awards" rows="3" /></label>
              <label>Other <textarea v-model="attForm.profile_en.other" rows="2" /></label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-primary" @click="saveAtt">💾 保存</button>
          <button class="btn-secondary" @click="showAttModal = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #0f1c18;
  color: #e0e6e3;
  padding: 40px 20px;
}

.admin-container {
  max-width: 1200px;
  margin: 0 auto;
}

.login-box {
  max-width: 360px;
  margin: 120px auto;
  text-align: center;
}

.login-box h1 {
  margin-bottom: 24px;
  font-size: 1.5rem;
}

.login-box input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #2a3f38;
  background: #1a2e28;
  color: #e0e6e3;
  font-size: 1rem;
  margin-bottom: 16px;
}

.login-box button {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: #3a9b7f;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.admin-header h1 {
  font-size: 1.4rem;
}

.admin-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.upload-area {
  padding: 12px 20px;
  border-radius: 8px;
  border: 2px dashed #2a3f38;
  background: #0f1c18;
  color: #8ba89d;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.upload-area:hover,
.upload-area.dragging {
  border-color: #3a9b7f;
  color: #3a9b7f;
  background: #162820;
}

.btn-primary {
  padding: 10px 18px;
  border-radius: 6px;
  background: #3a9b7f;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary:hover {
  background: #2d7d65;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 10px 18px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid #2a3f38;
  color: #e0e6e3;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid #1e332c;
  padding-bottom: 12px;
}

.tab {
  padding: 10px 20px;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: #8ba89d;
  cursor: pointer;
  font-size: 0.95rem;
}

.tab.active {
  background: #3a9b7f;
  color: #fff;
}

.article-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.article-table th,
.article-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #1e332c;
}

.article-table th {
  color: #8ba89d;
  font-weight: 500;
}

.article-table tr:hover td {
  background: #162820;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.link-edit,
.link-view,
.link-translate,
.link-delete {
  font-size: 0.85rem;
  text-decoration: none;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}

.link-edit {
  color: #3a9b7f;
}

.link-view {
  color: #6b9ac4;
}

.link-translate {
  color: #d4a574;
}

.link-delete {
  color: #c46b6b;
}

.loading,
.empty {
  text-align: center;
  padding: 60px 0;
  color: #8ba89d;
}

/* ========== 弹窗 ========== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal {
  background: #162820;
  border-radius: 12px;
  max-width: 520px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal--wide {
  max-width: 960px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #1e332c;
}

.modal-header h3 {
  font-size: 1.1rem;
  color: #e0e6e3;
}

.modal-close {
  background: none;
  border: none;
  color: #8ba89d;
  font-size: 1.2rem;
  cursor: pointer;
}

.modal-close:hover {
  color: #e0e6e3;
}

.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #1e332c;
}

/* ========== 表单 ========== */
.form-section {
  background: #0f1c18;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
}

.form-section h4 {
  font-size: 0.95rem;
  color: #3a9b7f;
  margin-bottom: 12px;
}

.form-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 768px) {
  .form-two-col {
    grid-template-columns: 1fr;
  }
}

label {
  display: block;
  font-size: 0.85rem;
  color: #8ba89d;
  margin-bottom: 12px;
}

label input[type="text"],
label input[type="number"],
label textarea {
  display: block;
  width: 100%;
  margin-top: 6px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #2a3f38;
  background: #1a2e28;
  color: #e0e6e3;
  font-size: 0.95rem;
  box-sizing: border-box;
}

label textarea {
  resize: vertical;
}

label input[type="checkbox"] {
  margin-right: 6px;
  vertical-align: middle;
}

.form-row-inline {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.form-row-inline label {
  margin-bottom: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ========== 头像上传 ========== */
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.avatar-preview {
  width: 120px;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #2a3f38;
}

.avatar-placeholder {
  width: 120px;
  height: 160px;
  border-radius: 8px;
  border: 2px dashed #2a3f38;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8ba89d;
  font-size: 0.85rem;
}
</style>
