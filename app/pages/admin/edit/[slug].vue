<script setup lang="ts">
import type { ArticleRaw, ArticleBlock } from '~/pages/article/data'

definePageMeta({
  layout: false,
})

const route = useRoute()
const router = useRouter()
const slugParam = route.params.slug as string
const isNew = slugParam === 'new'

// 加载现有文章
const { data: existingArticle } = isNew
  ? { data: ref<ArticleRaw | null>(null) }
  : await useFetch<ArticleRaw>(`/api/articles/${slugParam}`)

// 表单数据
const form = reactive<ArticleRaw>({
  id: 1,
  slug: '',
  date: new Date().toISOString().split('T')[0],
  tags: [],
  translations: {
    zh: {
      title: '',
      lead: '',
      subtitle: '',
      meta: { date: '', author: '青颂律师事务所' },
      blocks: [],
      conclusion: '',
      references: [],
    },
    en: {
      title: '',
      lead: '',
      subtitle: '',
      meta: { date: '', author: 'Qingsong Law Firm' },
      blocks: [],
      conclusion: '',
      references: [],
    },
  },
})

// blocks JSON 编辑器内容
const zhBlocksJson = ref('[]')
const enBlocksJson = ref('[]')
const zhRefsText = ref('')
const enRefsText = ref('')
const tagsText = ref('')

function initForm(article: ArticleRaw) {
  form.id = article.id
  form.slug = article.slug
  form.date = article.date
  form.tags = article.tags || []
  tagsText.value = (article.tags || []).join(', ')

  // 中文
  const zh = article.translations.zh
  if (zh) {
    form.translations.zh = { ...zh }
    zhBlocksJson.value = JSON.stringify(zh.blocks || [], null, 2)
    zhRefsText.value = (zh.references || []).join('\n')
  }

  // 英文
  const en = article.translations.en
  if (en) {
    form.translations.en = { ...en }
    enBlocksJson.value = JSON.stringify(en.blocks || [], null, 2)
    enRefsText.value = (en.references || []).join('\n')
  }
}

// 如果是编辑模式，初始化表单
if (existingArticle.value) {
  initForm(existingArticle.value)
}

function parseBlocks(json: string): ArticleBlock[] {
  try {
    return JSON.parse(json) as ArticleBlock[]
  } catch {
    alert('blocks JSON 格式错误，请检查')
    return []
  }
}

function parseRefs(text: string): string[] {
  return text.split('\n').map((s) => s.trim()).filter(Boolean)
}

async function save() {
  // 更新 tags
  form.tags = tagsText.value.split(',').map((s) => s.trim()).filter(Boolean)

  // 更新 blocks 和 references
  const zhBlocks = parseBlocks(zhBlocksJson.value)
  const enBlocks = parseBlocks(enBlocksJson.value)
  if (!zhBlocks.length && !isNew) return

  form.translations.zh.blocks = zhBlocks
  form.translations.en.blocks = enBlocks
  form.translations.zh.references = parseRefs(zhRefsText.value)
  form.translations.en.references = parseRefs(enRefsText.value)

  // 同步 meta.date
  form.translations.zh.meta.date = form.date
  form.translations.en.meta.date = form.date

  const oldSlug = isNew ? undefined : slugParam

  try {
    await $fetch('/api/articles', {
      method: 'POST',
      body: form,
      query: oldSlug ? { oldSlug } : undefined,
    })
    alert('保存成功！')
    router.push('/admin')
  } catch (e: any) {
    alert('保存失败: ' + (e.message || '未知错误'))
  }
}

// 复制模板（新建时可用）
const showTemplateModal = ref(false)
const { data: allArticles } = await useFetch<ArticleRaw[]>('/api/articles')

function copyTemplate(article: ArticleRaw) {
  initForm(article)
  // 清空特定内容，保留结构
  form.slug = 'article-new'
  form.id = (allArticles.value?.length || 0) + 1
  form.date = new Date().toISOString().split('T')[0]
  form.translations.zh.title = ''
  form.translations.zh.lead = ''
  form.translations.zh.conclusion = ''
  form.translations.en.title = ''
  form.translations.en.lead = ''
  form.translations.en.conclusion = ''
  showTemplateModal.value = false
}
</script>

<template>
  <div class="admin-page">
    <div class="admin-container">
      <div class="edit-header">
        <NuxtLink to="/admin" class="back-link">← 返回列表</NuxtLink>
        <h1>{{ isNew ? '新建文章' : '编辑文章' }}</h1>
        <button v-if="isNew" class="btn-secondary" @click="showTemplateModal = true">
          复制现有文章作为模板
        </button>
      </div>

      <div class="edit-form">
        <!-- 基本信息 -->
        <section class="form-section">
          <h2>基本信息</h2>
          <div class="form-row">
            <label>ID <input v-model.number="form.id" type="number" /></label>
            <label>Slug <input v-model="form.slug" type="text" placeholder="article-001" /></label>
            <label>日期 <input v-model="form.date" type="date" /></label>
          </div>
          <div class="form-row">
            <label class="full">
              标签（逗号分隔）
              <input v-model="tagsText" type="text" placeholder="公司法, 股权转让" />
            </label>
          </div>
        </section>

        <!-- 中文内容 -->
        <section class="form-section">
          <h2>🇨🇳 中文内容</h2>
          <label>标题 <input v-model="form.translations.zh.title" type="text" /></label>
          <label>副标题 <input v-model="form.translations.zh.subtitle" type="text" /></label>
          <label>导语（lead）<textarea v-model="form.translations.zh.lead" rows="3" /></label>
          <label>作者 <input v-model="form.translations.zh.meta.author" type="text" /></label>
          <label>结论 <textarea v-model="form.translations.zh.conclusion" rows="3" /></label>
          <label>
            参考资料（每行一个）
            <textarea v-model="zhRefsText" rows="4" />
          </label>
          <label>
            Blocks JSON（文章正文段落）
            <textarea v-model="zhBlocksJson" rows="20" class="code-editor" />
          </label>
        </section>

        <!-- 英文内容 -->
        <section class="form-section">
          <h2>🇺🇸 英文内容</h2>
          <label>标题 <input v-model="form.translations.en.title" type="text" /></label>
          <label>副标题 <input v-model="form.translations.en.subtitle" type="text" /></label>
          <label>导语（lead）<textarea v-model="form.translations.en.lead" rows="3" /></label>
          <label>作者 <input v-model="form.translations.en.meta.author" type="text" /></label>
          <label>结论 <textarea v-model="form.translations.en.conclusion" rows="3" /></label>
          <label>
            参考资料（每行一个）
            <textarea v-model="enRefsText" rows="4" />
          </label>
          <label>
            Blocks JSON（文章正文段落）
            <textarea v-model="enBlocksJson" rows="20" class="code-editor" />
          </label>
        </section>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <button class="btn-primary btn-large" @click="save">💾 保存文章</button>
          <NuxtLink to="/admin" class="btn-secondary btn-large">取消</NuxtLink>
        </div>
      </div>
    </div>

    <!-- 模板选择弹窗 -->
    <div v-if="showTemplateModal" class="modal-overlay" @click="showTemplateModal = false">
      <div class="modal" @click.stop>
        <h3>选择一个文章作为模板</h3>
        <div class="template-list">
          <div
            v-for="a in allArticles"
            :key="a.slug"
            class="template-item"
            @click="copyTemplate(a)"
          >
            <strong>{{ a.translations.zh?.title || a.slug }}</strong>
            <span>{{ a.slug }}</span>
          </div>
        </div>
        <button class="btn-secondary" @click="showTemplateModal = false">关闭</button>
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
  max-width: 960px;
  margin: 0 auto;
}

.edit-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}
.edit-header h1 {
  font-size: 1.4rem;
  flex: 1;
}
.back-link {
  color: #8ba89d;
  text-decoration: none;
  font-size: 0.9rem;
}
.back-link:hover {
  color: #3a9b7f;
}

.form-section {
  background: #162820;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}
.form-section h2 {
  font-size: 1.1rem;
  margin-bottom: 16px;
  color: #3a9b7f;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}
.form-row label {
  flex: 1;
}
.form-row label.full {
  flex: 100%;
}

label {
  display: block;
  font-size: 0.85rem;
  color: #8ba89d;
  margin-bottom: 16px;
}
label input,
label textarea {
  display: block;
  width: 100%;
  margin-top: 6px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #2a3f38;
  background: #0f1c18;
  color: #e0e6e3;
  font-size: 0.95rem;
}
label textarea {
  resize: vertical;
}
.code-editor {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.85rem;
  line-height: 1.5;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 24px 0 40px;
}
.btn-primary {
  padding: 12px 28px;
  border-radius: 8px;
  background: #3a9b7f;
  color: #fff;
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  font-size: 1rem;
}
.btn-primary:hover {
  background: #2d7d65;
}
.btn-secondary {
  padding: 12px 28px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid #2a3f38;
  color: #e0e6e3;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  font-size: 1rem;
}
.btn-large {
  padding: 14px 36px;
  font-size: 1.05rem;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: #162820;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 70vh;
  overflow-y: auto;
}
.modal h3 {
  margin-bottom: 16px;
}
.template-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.template-item {
  padding: 12px;
  background: #0f1c18;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}
.template-item:hover {
  background: #1e332c;
}
.template-item strong {
  color: #e0e6e3;
}
.template-item span {
  color: #8ba89d;
  font-size: 0.8rem;
  margin-top: 4px;
}
</style>
