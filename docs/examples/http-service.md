# HTTP 请求服务 — 无状态请求工具

## 场景描述

封装 HTTP 请求服务，提供 GET/POST/PUT/DELETE 方法。服务本身不持有 loading/error 状态，每个请求的状态由调用方独立管理。

## 设计原则（参考 Angular HttpClient）

- **服务无状态** — 不维护全局 loading/error，每个请求的状态由调用方用 `ref()` 独立管理
- **@Raw() 跳过响应式** — 服务实例不需要 Vue 响应式追踪，避免不必要的性能开销
- **commonHeaders** — 公共请求头（如 token）统一配置，自动合并到每个请求

## 服务定义

```ts
import { Injectable, Raw } from '@kaokei/use-vue-service';

interface FetchConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

@Raw()
@Injectable()
export class ApiService {
  baseURL = '';

  commonHeaders: Record<string, string> = {};

  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  setHeader(key: string, value: string): void {
    this.commonHeaders[key] = value;
  }

  removeHeader(key: string): void {
    delete this.commonHeaders[key];
  }

  async get<T = any>(url: string, config?: FetchConfig): Promise<T> {
    return this.request<T>(url, { method: 'GET', ...config });
  }

  async post<T = any>(
    url: string,
    body?: any,
    config?: FetchConfig
  ): Promise<T> {
    return this.request<T>(url, { method: 'POST', body, ...config });
  }

  async put<T = any>(
    url: string,
    body?: any,
    config?: FetchConfig
  ): Promise<T> {
    return this.request<T>(url, { method: 'PUT', body, ...config });
  }

  async delete<T = any>(url: string, config?: FetchConfig): Promise<T> {
    return this.request<T>(url, { method: 'DELETE', ...config });
  }

  private async request<T>(
    url: string,
    config: FetchConfig & { method: string; body?: any }
  ): Promise<T> {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.commonHeaders,
      ...config.headers,
    };

    const response = await fetch(fullURL, {
      method: config.method,
      headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }
}
```

## 组件使用

```vue
<script lang="ts" setup>
import { ref } from 'vue';
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { ApiService } from './api.service';

declareProviders([ApiService]);
const api = useService(ApiService);

// ===== 每个请求独立管理自己的状态 =====

// 请求 1：获取用户
const userLoading = ref(false);
const userError = ref('');
const user = ref();

async function fetchUser(id: number) {
  userLoading.value = true;
  userError.value = '';
  try {
    user.value = await api.get(`/users/${id}`);
  } catch (err: any) {
    userError.value = err.message;
  } finally {
    userLoading.value = false;
  }
}

// 请求 2：获取列表（与请求 1 的 loading 互不干扰）
const listLoading = ref(false);
const listError = ref('');
const list = ref([]);

async function fetchList() {
  listLoading.value = true;
  listError.value = '';
  try {
    list.value = await api.get('/posts');
  } catch (err: any) {
    listError.value = err.message;
  } finally {
    listLoading.value = false;
  }
}

// 请求 3：POST 创建
const createLoading = ref(false);
const createResult = ref('');

async function createPost() {
  createLoading.value = true;
  try {
    const result = await api.post('/posts', {
      title: '新文章',
      body: '文章内容',
    });
    createResult.value = `创建成功，ID: ${result.id}`;
  } catch (err: any) {
    createResult.value = `失败: ${err.message}`;
  } finally {
    createLoading.value = false;
  }
}

// 初始化配置
api.setBaseURL('https://jsonplaceholder.typicode.com');
// api.setHeader('Authorization', 'Bearer xxx');
</script>

<template>
  <div>
    <!-- 请求 1 -->
    <div>
      <button @click="fetchUser(1)" :disabled="userLoading">
        {{ userLoading ? '加载中...' : '获取用户' }}
      </button>
      <p v-if="userError" style="color: red">{{ userError }}</p>
      <div v-if="user">
        <strong>{{ user.name }}</strong>
        <span>{{ user.email }}</span>
      </div>
    </div>

    <!-- 请求 2 — loading 与请求 1 互不影响 -->
    <div>
      <button @click="fetchList" :disabled="listLoading">
        {{ listLoading ? '加载中...' : '获取列表' }}
      </button>
      <p v-if="listError" style="color: red">{{ listError }}</p>
      <ul>
        <li v-for="item in list" :key="item.id">{{ item.title }}</li>
      </ul>
    </div>

    <!-- 请求 3 -->
    <div>
      <button @click="createPost" :disabled="createLoading">
        {{ createLoading ? '提交中...' : '创建文章' }}
      </button>
      <p>{{ createResult }}</p>
    </div>
  </div>
</template>
```

## 关键要点

1. **@Raw() 跳过响应式** — 服务实例不需要 Vue 做 reactive 包装，因为它是无状态的请求工具，没有需要在模板中绑定的响应式属性。
2. **服务不持有 loading/error** — 这是 Angular HttpClient 10 年验证的设计原则。一个 service 可能被多个组件注入，如果 loading 是全局的，组件 A 的请求会导致组件 B 也显示 loading。
3. **每个请求独立管理状态** — 调用方用 `ref()` 创建自己的 `loading`、`error`、`data`，多个并发请求互不干扰。
4. **commonHeaders 统一配置** — 公共请求头（如 token）通过 `setHeader()` 配置一次，所有请求自动携带。
5. **错误交给调用方** — 请求失败直接 throw，由调用方 try/catch 处理，错误信息由调用方决定如何展示。
