<script setup lang="ts">
import { HttpService } from '~/services/HttpService'

declareProviders([HttpService])

const http = useService(HttpService)

// 每个请求独立管理自己的 loading 和 error 状态
const userLoading = ref(false)
const userError = ref('')
const user = ref<any>(null)

const postLoading = ref(false)
const postError = ref('')
const posts = ref<any[]>([])

// 独立请求 1：获取单个用户
async function fetchUser(id: number) {
  userLoading.value = true
  userError.value = ''
  try {
    user.value = await http.get<any>(`/users/${id}`)
  } catch (err: any) {
    userError.value = err.message || '请求失败'
    user.value = null
  } finally {
    userLoading.value = false
  }
}

// 独立请求 2：获取文章列表
async function fetchPosts() {
  postLoading.value = true
  postError.value = ''
  try {
    posts.value = await http.get<any[]>('/posts')
  } catch (err: any) {
    postError.value = err.message || '请求失败'
  } finally {
    postLoading.value = false
  }
}

// 独立请求 3：创建文章（演示 POST）
const createLoading = ref(false)
const createResult = ref('')

async function createPost() {
  createLoading.value = true
  try {
    const result = await http.post<any>('/posts', {
      title: '测试文章',
      body: '这是通过 HttpService 发送的 POST 请求',
      userId: 1,
    })
    createResult.value = `创建成功！ID: ${result.id}`
  } catch (err: any) {
    createResult.value = `创建失败: ${err.message}`
  } finally {
    createLoading.value = false
  }
}

// 初始化：设置 baseURL
http.setBaseURL('https://jsonplaceholder.typicode.com')
</script>

<template>
  <div style="max-width: 640px;">
    <h1>🌐 HTTP 请求服务示例</h1>
    <p style="color: #666;">
      演示 HttpService：无状态设计、每个请求独立 loading/error、基于 Nuxt $fetch。
    </p>

    <!-- 请求 1：GET 单个用户 -->
    <section style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 6px;">
      <h2>GET /users/1 — 获取用户</h2>
      <button @click="fetchUser(1)" :disabled="userLoading">
        {{ userLoading ? '加载中...' : '发送请求' }}
      </button>

      <div v-if="userLoading" style="margin-top: 8px; color: #999;">⏳ 请求中...</div>

      <div v-if="userError" style="margin-top: 8px; color: #ef4444;">
        ❌ {{ userError }}
      </div>

      <div v-if="user" style="margin-top: 8px; padding: 8px; background: #fff; border-radius: 4px;">
        <strong>{{ user.name }}</strong>
        <p style="margin: 4px 0; color: #666;">{{ user.email }}</p>
        <p style="margin: 0; color: #999; font-size: 13px;">{{ user.company?.name }}</p>
      </div>
    </section>

    <!-- 请求 2：GET 文章列表 -->
    <section style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 6px;">
      <h2>GET /posts — 获取列表</h2>
      <div style="display: flex; gap: 8px; align-items: center;">
        <button @click="fetchPosts" :disabled="postLoading">
          {{ postLoading ? '加载中...' : '加载文章' }}
        </button>
        <span v-if="posts.length">共 {{ posts.length }} 条</span>
      </div>

      <div v-if="postError" style="margin-top: 8px; color: #ef4444;">
        ❌ {{ postError }}
      </div>

      <ul v-if="posts.length" style="margin-top: 8px; padding-left: 20px; max-height: 200px; overflow-y: auto;">
        <li v-for="post in posts.slice(0, 5)" :key="post.id">
          {{ post.title }}
        </li>
        <li v-if="posts.length > 5" style="color: #999;">... 还有 {{ posts.length - 5 }} 条</li>
      </ul>
    </section>

    <!-- 请求 3：POST 创建 -->
    <section style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 6px;">
      <h2>POST /posts — 创建文章</h2>
      <button @click="createPost" :disabled="createLoading">
        {{ createLoading ? '提交中...' : '发送 POST' }}
      </button>

      <div v-if="createResult" style="margin-top: 8px; padding: 8px; background: #fff; border-radius: 4px;">
        {{ createResult }}
      </div>
    </section>

    <!-- 请求状态对比说明 -->
    <section style="margin-top: 24px; padding: 16px; background: #e8f5e9; border-radius: 6px; font-size: 14px; color: #555;">
      <strong>💡 架构要点：</strong>
      <ul style="margin: 8px 0 0; padding-left: 20px;">
        <li><strong>服务无状态</strong> — HttpService 不维护 loading/error，每个请求状态由调用方用 <code>ref()</code> 独立管理</li>
        <li>三个按钮触发三个独立请求，各自的 loading 互不干扰</li>
        <li><strong>commonHeaders</strong> — 公共请求头（如 token）通过 <code>setHeader()</code> 配置，所有请求自动携带</li>
        <li>底层使用 Nuxt 内置的 <code>$fetch</code>，支持所有 ofetch 特性</li>
      </ul>
    </section>
  </div>
</template>
