<script setup lang="ts">
import { onMounted } from 'vue'
import { ArticleSearchService, STATUS_OPTIONS, STATUS_LABEL_MAP } from '~/services/ArticleSearchService'

declareProviders([ArticleSearchService])

const search = useService(ArticleSearchService)

// 页面加载时从 URL 恢复查询条件
onMounted(() => {
  search.queryFromUrl()
})

// 分页大小选项
const pageSizes = [10, 20, 50]

// 计算总页数
const totalPages = computed(() => Math.ceil(search.total / search.pageSize))

// 分页按钮范围
const pageRange = computed(() => {
  const current = search.pageNum
  const total = totalPages.value
  if (total <= 1) return [] as number[]
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages: number[] = []
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const showStartEllipsis = computed(() => {
  if (totalPages.value <= 7) return false
  return search.pageNum > 3
})

const showEndEllipsis = computed(() => {
  if (totalPages.value <= 7) return false
  return search.pageNum < totalPages.value - 2
})

function goToPage(page: number) {
  search.onPageChange(page)
}

function onPageSizeChange(event: Event) {
  search.onPageSizeChange(Number((event.target as HTMLSelectElement).value))
}

function onStatusChange(event: Event) {
  const target = event.target as HTMLSelectElement
  search.model.status = target.value
  search.immediateSearch()
}
</script>

<template>
  <div style="max-width: 800px;">
    <h1>🔍 搜索分页服务示例</h1>
    <p style="color: #666;">
      演示 SearchService 基类：防抖搜索、分页、URL 持久化。刷新页面后查询条件不丢失。
    </p>

    <!-- 搜索表单 -->
    <section style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 6px;">
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <input
          v-model="search.model.keyword"
          placeholder="搜索文章标题或作者"
          @input="search.search()"
          style="flex: 1; min-width: 200px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
        />
        <select
          :value="search.model.status"
          @change="onStatusChange"
          style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
        >
          <option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <button @click="search.reset()" style="padding: 8px 16px; border: 1px solid #ccc; border-radius: 4px; background: #fff; cursor: pointer;">
          重置
        </button>
      </div>
    </section>

    <!-- 状态栏 -->
    <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: #666;">
      <span>
        共 <strong>{{ search.total }}</strong> 条
        <span v-if="search.loading" style="margin-left: 8px; color: #999;">⏳ 搜索中...</span>
      </span>
      <span v-if="search.error" style="color: #ef4444;">❌ {{ search.error }}</span>
    </div>

    <!-- 数据表格 -->
    <table style="width: 100%; margin-top: 8px; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr style="background: #f9f9f9; text-align: left;">
          <th style="padding: 10px 12px; border-bottom: 2px solid #e0e0e0; width: 60px;">ID</th>
          <th style="padding: 10px 12px; border-bottom: 2px solid #e0e0e0;">标题</th>
          <th style="padding: 10px 12px; border-bottom: 2px solid #e0e0e0; width: 80px;">作者</th>
          <th style="padding: 10px 12px; border-bottom: 2px solid #e0e0e0; width: 100px;">状态</th>
          <th style="padding: 10px 12px; border-bottom: 2px solid #e0e0e0; width: 110px;">发布时间</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="search.list.length === 0 && !search.loading">
          <td colspan="5" style="padding: 40px; text-align: center; color: #999;">暂无数据</td>
        </tr>
        <tr v-for="item in search.list" :key="item.id" style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 10px 12px; color: #999;">{{ item.id }}</td>
          <td style="padding: 10px 12px;">{{ item.title }}</td>
          <td style="padding: 10px 12px;">{{ item.author }}</td>
          <td style="padding: 10px 12px;">
            <span :style="{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              background: item.status === 'published' ? '#e8f5e9' : item.status === 'draft' ? '#fff3e0' : '#f5f5f5',
              color: item.status === 'published' ? '#2e7d32' : item.status === 'draft' ? '#e65100' : '#999',
            }">
              {{ STATUS_LABEL_MAP[item.status] || item.status }}
            </span>
          </td>
          <td style="padding: 10px 12px; color: #999;">{{ item.publishTime }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 分页 -->
    <div v-if="search.total > 0" style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
      <div style="display: flex; align-items: center; gap: 4px; font-size: 14px;">
        <span style="color: #666;">每页</span>
        <select
          :value="search.pageSize"
          @change="onPageSizeChange"
          style="padding: 4px 8px; border: 1px solid #ccc; border-radius: 4px;"
        >
          <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
        </select>
        <span style="color: #666;">条</span>
      </div>

      <div style="display: flex; align-items: center; gap: 4px;">
        <button
          :disabled="search.pageNum <= 1"
          @click="goToPage(1)"
          style="padding: 4px 12px; border: 1px solid #ccc; border-radius: 4px; background: #fff; cursor: pointer;"
        >
          首页
        </button>
        <button
          :disabled="search.pageNum <= 1"
          @click="goToPage(search.pageNum - 1)"
          style="padding: 4px 12px; border: 1px solid #ccc; border-radius: 4px; background: #fff; cursor: pointer;"
        >
          上一页
        </button>

        <button
          v-if="totalPages > 7"
          :style="{
            padding: '4px 10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            background: 1 === search.pageNum ? '#42b883' : '#fff',
            color: 1 === search.pageNum ? '#fff' : '#333',
            fontWeight: 1 === search.pageNum ? '600' : '400',
          }"
          @click="goToPage(1)"
        >
          1
        </button>

        <span v-if="showStartEllipsis" style="padding: 0 4px; color: #999;">...</span>

        <button
          v-for="p in pageRange"
          :key="p"
          @click="goToPage(p)"
          :style="{
            padding: '4px 10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            background: p === search.pageNum ? '#42b883' : '#fff',
            color: p === search.pageNum ? '#fff' : '#333',
            fontWeight: p === search.pageNum ? '600' : '400',
          }"
        >
          {{ p }}
        </button>

        <span v-if="showEndEllipsis" style="padding: 0 4px; color: #999;">...</span>

        <button
          v-if="totalPages > 7 && totalPages > 1"
          @click="goToPage(totalPages)"
          :style="{
            padding: '4px 10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            background: totalPages === search.pageNum ? '#42b883' : '#fff',
            color: totalPages === search.pageNum ? '#fff' : '#333',
            fontWeight: totalPages === search.pageNum ? '600' : '400',
          }"
        >
          {{ totalPages }}
        </button>

        <button
          :disabled="search.pageNum >= totalPages"
          @click="goToPage(search.pageNum + 1)"
          style="padding: 4px 12px; border: 1px solid #ccc; border-radius: 4px; background: #fff; cursor: pointer;"
        >
          下一页
        </button>
        <button
          :disabled="search.pageNum >= totalPages"
          @click="goToPage(totalPages)"
          style="padding: 4px 12px; border: 1px solid #ccc; border-radius: 4px; background: #fff; cursor: pointer;"
        >
          末页
        </button>
      </div>
    </div>

    <!-- 实现要点 -->
    <section style="margin-top: 32px; padding: 16px; background: #e8f5e9; border-radius: 6px; font-size: 14px; color: #555;">
      <strong>💡 架构要点：</strong>
      <ul style="margin: 8px 0 0; padding-left: 20px;">
        <li><strong>继承基类</strong> — <code>ArticleSearchService extends SearchService</code>，只需实现 <code>query()</code> 方法</li>
        <li><strong>防抖搜索</strong> — 输入关键词时 300ms 防抖，下拉筛选立即搜索</li>
        <li><strong>URL 持久化</strong> — 搜索条件自动序列化到 URL，刷新页面后自动恢复</li>
        <li><strong>分页 + 列表 + total</strong> — <code>list</code>、<code>total</code>、<code>pageNum</code>、<code>pageSize</code> 都是响应式属性</li>
        <li><strong>RouterService</strong> — 通过 Nuxt 插件绑定到根容器，全局共享 router 实例</li>
      </ul>
    </section>
  </div>
</template>
