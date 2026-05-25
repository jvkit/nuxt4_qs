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
  title: string
  office: string
  avatar: string
  is_active: boolean
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

async function deleteArticle(slug: string) {
  if (!confirm(`确定删除文章 ${slug}？`)) return
  await $fetch(`/api/admin/article/${slug}`, { method: 'DELETE' })
  await refreshArticles()
}

async function translateArticle(slug: string) {
  if (!confirm(`确定翻译文章 ${slug}？这会调用 AI API 并产生费用。`)) return
  loading.value = true
  try {
    await $fetch(`/api/articles/${slug}/translate`, { method: 'POST' })
    alert('翻译完成！')
    await refreshArticles()
  } catch (e: any) {
    alert('翻译失败: ' + (e.message || '未知错误'))
  }
  loading.value = false
}

async function translatePracticeArea(slug: string) {
  if (!confirm(`确定翻译执业领域 ${slug}？`)) return
  loading.value = true
  try {
    await $fetch(`/api/practice-areas/${slug}/translate`, { method: 'POST' })
    alert('翻译完成！')
    await refreshPA()
  } catch (e: any) {
    alert('翻译失败: ' + e.message)
  }
  loading.value = false
}

async function translateAttorney(id: number) {
  if (!confirm(`确定翻译律师 ${id}？`)) return
  loading.value = true
  try {
    await $fetch(`/api/attorneys/${id}/translate`, { method: 'POST' })
    alert('翻译完成！')
    await refreshAtt()
  } catch (e: any) {
    alert('翻译失败: ' + e.message)
  }
  loading.value = false
}

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
      const res = await $fetch<{ success: boolean; title: string }>('/api/admin/upload', {
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
            <div class="upload-area" :class="{ dragging: isDragging }" @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop" @click="triggerFileInput">
              <input ref="fileInput" type="file" accept=".docx" multiple style="display: none"
                @change="handleFileSelect" />
              <span v-if="uploading">⏳ 转换中...</span>
              <span v-else>📁 拖拽 Word 上传</span>
            </div>
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
                <a :href="`/practice-areas/${p.slug}`" target="_blank" class="link-view">预览</a>
                <button class="link-translate" @click="translatePracticeArea(p.slug)">翻译</button>
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
                <a :href="`/attorney/${a.id}`" target="_blank" class="link-view">预览</a>
                <button class="link-translate" @click="translateAttorney(a.id)">翻译</button>
              </td>
            </tr>
          </tbody>
        </table>
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

.btn-secondary {
  padding: 10px 18px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid #2a3f38;
  color: #e0e6e3;
  cursor: pointer;
  font-size: 0.9rem;
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
</style>
