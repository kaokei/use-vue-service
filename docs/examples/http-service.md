# HTTP 服务 — 请求封装与响应缓存

## 场景描述

封装统一的 HTTP 请求服务，提供 GET/POST 等常用方法，支持请求缓存、加载状态和错误处理。

## 服务定义

```ts
import { Injectable } from '@kaokei/use-vue-service';

/** HTTP 请求选项 */
interface RequestOptions {
  /** 请求头 */
  headers?: Record<string, string>;
  /** 是否缓存响应结果 */
  cache?: boolean;
  /** 缓存有效期（毫秒），默认 5 分钟 */
  cacheTTL?: number;
}

/** 缓存的条目 */
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

/**
 * HTTP 请求服务。
 * 
 * 服务实例本身是 Vue reactive 对象，因此 loading 和 error
 * 属性在模板中直接是响应式的。
 */
@Injectable()
export class ApiService {
  /** 全局加载状态（响应式） */
  loading = false;

  /** 全局错误信息（响应式） */
  error = '';

  /** API 基础地址 */
  private baseURL = '';

  /** 响应缓存 Map */
  private cache = new Map<string, CacheEntry>();

  /** 默认缓存有效期：5 分钟 */
  private defaultCacheTTL = 5 * 60 * 1000;

  /**
   * 设置 API 基础地址。
   */
  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  /**
   * 发起 GET 请求。
   */
  async get<T = any>(
    url: string,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(url, { method: 'GET', ...options });
  }

  /**
   * 发起 POST 请求。
   */
  async post<T = any>(
    url: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  /**
   * 发起 PUT 请求。
   */
  async put<T = any>(
    url: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  /**
   * 发起 DELETE 请求。
   */
  async delete<T = any>(
    url: string,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(url, { method: 'DELETE', ...options });
  }

  /**
   * 清除所有缓存。
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 清除指定 URL 的缓存。
   */
  clearCacheFor(url: string): void {
    this.cache.delete(url);
  }

  /**
   * 核心请求方法。
   */
  private async request<T>(
    url: string,
    options: RequestOptions & { method: string; body?: string }
  ): Promise<T> {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    // 检查缓存
    if (options.cache && options.method === 'GET') {
      const cached = this.cache.get(fullURL);
      if (cached) {
        const age = Date.now() - cached.timestamp;
        if (age < cached.ttl) {
          return cached.data as T;
        }
        // 缓存过期，删除
        this.cache.delete(fullURL);
      }
    }

    this.loading = true;
    this.error = '';

    try {
      const response = await fetch(fullURL, {
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body,
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status} ${response.statusText}`);
      }

      const data: T = await response.json();

      // 写入缓存
      if (options.cache && options.method === 'GET') {
        this.cache.set(fullURL, {
          data,
          timestamp: Date.now(),
          ttl: options.cacheTTL ?? this.defaultCacheTTL,
        });
      }

      return data;
    } catch (err: any) {
      this.error = err?.message || '网络错误，请稍后重试';
      throw err;
    } finally {
      this.loading = false;
    }
  }
}
```

## 组件使用

```vue
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { ApiService } from './api.service';

// 声明服务
declareProviders(ApiService);

// 获取服务实例
const api = useService(ApiService);

// 组件本地状态
const users = ref<any[]>([]);
const isLoading = ref(false);

// 获取数据
async function fetchUsers() {
  isLoading.value = true;
  try {
    // GET 请求，开启缓存，10 分钟有效
    users.value = await api.get<any[]>('/users', {
      cache: true,
      cacheTTL: 10 * 60 * 1000,
    });
  } catch {
    // 错误信息在 api.error 中
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  api.setBaseURL('https://jsonplaceholder.typicode.com');
  fetchUsers();
});
</script>

<template>
  <div>
    <!-- 全局加载状态 -->
    <div v-if="api.loading || isLoading">加载中...</div>

    <!-- 全局错误提示 -->
    <p v-if="api.error" style="color: red">{{ api.error }}</p>

    <!-- 数据展示 -->
    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.name }}
      </li>
    </ul>

    <!-- 操作按钮 -->
    <button @click="fetchUsers">刷新数据</button>
    <button @click="api.clearCache()">清除缓存</button>
  </div>
</template>
```

## 关键要点

1. **服务实例是 reactive 对象** — `loading` 和 `error` 直接是响应式的，多个组件可共享同一状态。
2. **缓存由 Map 管理** — 按 URL 缓存 GET 请求结果，支持自定义 TTL。缓存到期自动淘汰。
3. **loading/error 是服务全局状态** — 所有请求共享，适合全局 loading 条；组件局部 loading 用 `ref` 单独管理。
4. **请求方法返回 Promise** — 调用方可以用 `await` 或 `.then()` 处理结果，灵活性高。
