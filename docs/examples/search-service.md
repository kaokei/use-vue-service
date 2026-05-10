# 搜索服务 — 防抖、加载状态与错误处理

## 场景描述

列表页面常见的搜索场景：用户在输入框中输入关键词，服务进行防抖处理后再发起查询，同时管理加载状态和错误提示。

## 服务定义

```ts
import { Injectable, autobind } from '@kaokei/use-vue-service';

/** 搜索结果的分页结构 */
interface SearchResult<T> {
  /** 总记录数 */
  total: number;
  /** 当前页码 */
  current: number;
  /** 每页条数 */
  pageSize: number;
  /** 数据列表 */
  records: T[];
}

/**
 * 通用搜索服务。
 * 
 * 服务实例本身是 Vue reactive 对象，因此 keyword、loading、error、results
 * 这些属性在模板中都是响应式的，无需手动 ref()/reactive() 包裹。
 */
@Injectable()
export class SearchService<T = any> {
  /** 搜索关键词（响应式） */
  keyword = '';

  /** 加载状态（响应式） */
  loading = false;

  /** 错误信息（响应式） */
  error = '';

  /** 搜索结果（响应式） */
  results: T[] = [];

  /** 分页信息（响应式） */
  pagination: SearchResult<T> | null = null;

  /** 当前页码 */
  pageNum = 1;

  /** 每页条数 */
  pageSize = 20;

  /** 防抖定时器句柄 */
  private timer: ReturnType<typeof setTimeout> | null = null;

  /** 防抖延迟毫秒数 */
  private debounceMs = 300;

  /**
   * 带防抖的搜索方法。
   * 用户连续输入时取消上一次定时器，只执行最后一次。
   */
  @autobind
  search(keyword?: string): void {
    if (keyword !== undefined) {
      this.keyword = keyword;
    }

    // 清除上一次的定时器
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }

    // 设置新的定时器
    this.timer = setTimeout(() => {
      this.doSearch();
    }, this.debounceMs);
  }

  /**
   * 立即搜索（不防抖）。
   */
  @autobind
  searchImmediately(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    this.doSearch();
  }

  /**
   * 翻页时调用。
   */
  @autobind
  onPageChange(pageNum: number, pageSize: number): void {
    this.pageNum = pageNum;
    this.pageSize = pageSize;
    this.searchImmediately();
  }

  /**
   * 重置搜索条件。
   */
  @autobind
  reset(): void {
    this.keyword = '';
    this.results = [];
    this.pagination = null;
    this.error = '';
    this.pageNum = 1;
  }

  /**
   * 执行实际的搜索请求。
   * 实际项目中替换为真实 API 调用。
   */
  private async doSearch(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      // 模拟 API 请求 —— 替换为你的实际接口调用
      // const res = await fetch(`/api/search?keyword=${this.keyword}&page=${this.pageNum}&size=${this.pageSize}`);
      // const data: SearchResult<T> = await res.json();
      
      // --- 以下是模拟数据，实际使用时删除 ---
      const data: SearchResult<T> = await mockSearch<T>(
        this.keyword,
        this.pageNum,
        this.pageSize
      );
      // --- 模拟数据结束 ---

      this.results = data.records;
      this.pagination = data;
    } catch (err: any) {
      this.error = err?.message || '搜索失败，请重试';
      this.results = [];
    } finally {
      this.loading = false;
    }
  }

  /**
   * 清理定时器。
   * 如果服务需要手动销毁，可配合 @PreDestroy() 使用。
   */
  dispose(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

// ----- 以下为模拟数据，仅用于示例，实际使用时删除 -----
async function mockSearch<T>(
  keyword: string,
  _pageNum: number,
  _pageSize: number
): Promise<SearchResult<T>> {
  // 模拟网络延迟
  await new Promise(r => setTimeout(r, 200));
  return {
    total: 0,
    current: _pageNum,
    pageSize: _pageSize,
    records: [],
  };
}
```

## 组件使用

```vue
<script lang="ts" setup>
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { SearchService } from './search.service';

// 声明服务，与当前组件绑定
declareProviders([SearchService]);

// 获取服务实例
const searchService = useService(SearchService);
</script>

<template>
  <div>
    <!-- 搜索输入框：输入时自动防抖搜索 -->
    <input
      v-model="searchService.keyword"
      placeholder="输入关键词搜索"
      @input="searchService.search(searchService.keyword)"
    />

    <!-- 加载状态 -->
    <span v-if="searchService.loading">搜索中...</span>

    <!-- 错误提示 -->
    <p v-if="searchService.error" style="color: red">
      {{ searchService.error }}
    </p>

    <!-- 搜索结果 -->
    <ul v-if="searchService.results.length > 0">
      <li v-for="item in searchService.results" :key="(item as any).id">
        {{ item }}
      </li>
    </ul>

    <!-- 空状态 -->
    <p v-else-if="!searchService.loading && searchService.keyword">
      没有找到相关结果
    </p>
  </div>
</template>
```

## 关键要点

1. **服务实例本身就是 reactive 对象** — `keyword`、`loading`、`error`、`results` 等普通属性在模板中直接是响应式的，无需 `ref()`/`reactive()` 包裹。
2. **@autobind 自动绑定 this** — 方法作为事件回调（如 `@input`）传递时，`this` 不会丢失。
3. **防抖通过 setTimeout/clearTimeout 实现** — 每次输入取消上一次定时器，只执行最后一次。
4. **loading/error 状态是普通布尔值和字符串** — 直接赋值即可驱动模板更新。
