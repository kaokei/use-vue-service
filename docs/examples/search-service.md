# 搜索服务 — 基类继承、防抖、分页与 URL 持久化

## 场景描述

列表页面的搜索是一个可复用的通用模式：表单绑定多个筛选条件、防抖输入、分页翻页、刷新页面后保留查询条件。

`SearchService` 被设计为**可继承的基类**，封装了防抖搜索、分页、表单模型与 API 参数的转换、以及 URL 序列化/反序列化能力。业务子类只需声明默认表单模型（`defaultModel`）、额外固定参数（`extraModel`）、分页字段名（`pageNumKey`/`pageSizeKey`），并实现 `query()` 方法即可获得完整的搜索分页功能。

## 服务定义（基类）

`SearchService<T>` 是一个泛型基类，`T` 表示列表项的实体类型。基类本身**不**可直接使用 —— 它的 `query()` 方法会抛出错误，必须通过子类继承来提供实际的查询逻辑。

```ts
import { Injectable, Inject, PreDestroy } from '@kaokei/use-vue-service'
import { RouterService } from './RouterService'

interface PaginationResult<T> {
  total: number
  current: number
  size: number
  records: T[]
}

@Injectable()
export class SearchService<T = any> {
  // 实例被 reactive() 包裹，普通属性即为响应式
  loading = false
  list: T[] = []
  total = 0
  error = ''

  // 表单绑定对象（子类声明 defaultModel 后自动使用）
  model: Record<string, any> = {}

  // 默认 model（用于重置）
  defaultModel: Record<string, any> = {}

  // 不可被用户修改但需传递给接口的数据
  extraModel: Record<string, any> = {}

  // model → 接口参数的转换器
  model2TOParserMap: Record<string, (value: any) => any> = {}

  // 序列化到 URL 时的转换器
  modelStringifierMap: Record<string, (value: any) => any> = {}

  // 从 URL 反序列化时的转换器
  modelParserMap: Record<string, (value: any) => any> = {}

  // URL 上存储 model 的 query key
  QUERY_KEY_FOR_MODEL = 'q'

  // 分页字段
  pageNum = 1
  pageSize = 20
  pageNumKey = 'currentPage'
  pageSizeKey = 'limit'

  // 防抖延迟（毫秒）
  debounceMs = 300
  private _debounceTimer: ReturnType<typeof setTimeout> | null = null

  @Inject(RouterService)
  routerService!: RouterService

  // ===== 子类必须实现的方法 =====

  query(): Promise<PaginationResult<T> | void> {
    throw new Error('子类必须实现 query 方法')
  }

  // ===== 防抖功能 =====

  debouncedSearch(): void {
    this.clearDebounce()
    this._debounceTimer = setTimeout(() => {
      this.doSearch()
    }, this.debounceMs)
  }

  immediateSearch(): void {
    this.clearDebounce()
    this.doSearch()
  }

  clearDebounce(): void {
    if (this._debounceTimer !== null) {
      clearTimeout(this._debounceTimer)
      this._debounceTimer = null
    }
  }

  private doSearch(): void {
    this.resetPageNum()
    this.saveModelThenQuery()
  }

  // ===== 用户操作入口 =====

  search(): void {
    this.debouncedSearch()
  }

  reset(): void {
    this.resetPageNum()
    this.resetPageSize()
    this.resetModel()
    this.saveModelThenQuery()
  }

  onPageChange(pageNum: number): void {
    this.pageNum = pageNum
    this.saveModelThenQuery()
  }

  onPageSizeChange(pageSize: number): void {
    this.pageNum = 1
    this.pageSize = pageSize
    this.saveModelThenQuery()
  }

  // ===== 内部方法 =====

  private resetPageNum(num?: number): void {
    this.pageNum = num || 1
  }

  private resetPageSize(size?: number): void {
    this.pageSize = size || 20
  }

  resetModel(newModel?: Record<string, any>): void {
    if (newModel && Object.keys(newModel).length > 0) {
      this.model = { ...newModel }
    } else {
      this.model = { ...this.defaultModel }
    }
  }

  private getSavingModel(): Record<string, any> {
    return {
      ...this.model,
      pageNum: this.pageNum,
      pageSize: this.pageSize,
    }
  }

  getFormModel(): Record<string, any> {
    const data = this.model2TO(this.model)
    return {
      ...data,
      ...this.extraModel,
      [this.pageNumKey]: this.pageNum,
      [this.pageSizeKey]: this.pageSize,
    }
  }

  private saveModelThenQuery(): void {
    this.saveModelToUrl()
    this.executeQuery()
  }

  private saveModelToUrl(): void {
    if (this.routerService) {
      const str = this.modelToString(this.getSavingModel())
      this.routerService.updateQuery({
        [this.QUERY_KEY_FOR_MODEL]: str,
      })
    }
  }

  private async executeQuery(): Promise<void> {
    this.loading = true
    this.error = ''
    try {
      const res = await this.query()
      if (res) {
        this.list = res.records
        this.total = res.total
        // 分页越界检查
        if (res.current > 1 && res.records.length === 0) {
          return this.search()
        }
      }
    } catch (err: any) {
      this.error = err?.message || '查询失败'
    } finally {
      this.loading = false
    }
  }

  // ===== URL 序列化/反序列化 =====

  /**
   * 页面加载时从 URL 恢复查询参数并执行搜索。
   */
  queryFromUrl(): void {
    const query = this.routerService?.currentQuery
    const str = query?.[this.QUERY_KEY_FOR_MODEL]

    if (str) {
      const { pageNum, pageSize, ...rest } = this.modelFromString(str)
      this.pageNum = pageNum || 1
      this.pageSize = pageSize || 20
      this.model = { ...this.defaultModel, ...rest }
    } else {
      this.model = { ...this.defaultModel }
    }

    this.executeQuery()
  }

  private model2TO(model: Record<string, any>): Record<string, any> {
    return Object.keys(model).reduce((acc, key) => {
      const value = model[key]
      const func = this.model2TOParserMap[key]
      if (func) {
        const result = func(value)
        if (result && typeof result === 'object') {
          return { ...acc, ...result }
        }
        if (result !== undefined) {
          return { ...acc, [key]: result }
        }
        return acc
      }
      return { ...acc, [key]: value }
    }, {})
  }

  private modelToString(model: Record<string, any>): string {
    return JSON.stringify(model, (_key, value) => {
      const func = this.modelStringifierMap[_key]
      return func ? func(value) : value
    })
  }

  private modelFromString(str: string): Record<string, any> {
    try {
      return JSON.parse(str, (_key, value) => {
        const func = this.modelParserMap[_key]
        return func ? func(value) : value
      })
    } catch {
      return {}
    }
  }

  // ===== 生命周期 =====

  @PreDestroy()
  dispose(): void {
    this.clearDebounce()
  }
}
```

### 基类设计要点

| 设计决策 | 原因 |
|---------|------|
| **泛型基类而非独立服务** | 不同业务有不同的筛选条件、API 端点、分页字段名。基类封装通用逻辑，子类只负责差异化配置。 |
| **`model` 而非扁平属性** | 支持任意多筛选条件，通过 `model.X` 与表单控件绑定，子类通过 `defaultModel` 声明结构。 |
| **`extraModel` 独立于 `model`** | 有些参数需要传给接口但不由用户修改（如 `type: 'article'`），不应出现在重置逻辑中。 |
| **`model2TOParserMap` 转换层** | 前端表单字段名与 API 字段名不一致时，可在子类中挂载转换函数，无需修改基类。 |
| **搜索自动重置到第 1 页** | `doSearch()` 调用 `resetPageNum()`，确保筛选条件变化后从第一页开始展示。 |
| **分页越界自动回退** | `executeQuery()` 检测到当前页无数据且非第一页时，自动触发 `search()` 回到首页。 |

## 业务子类定义

`ArticleSearchService` 继承 `SearchService<Article>`，只需声明模型结构、额外参数、分页字段名，并覆写 `query()` 方法。

```ts
import { Injectable } from '@kaokei/use-vue-service'
import { SearchService } from './SearchService'

interface Article {
  id: number
  title: string
  author: string
  status: string
  publishTime: string
}

// 状态常量 — 统一的 value/label 映射
export const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'published', label: '已发布' },
  { value: 'draft', label: '草稿' },
  { value: 'archived', label: '已归档' },
] as const

const STATUS_VALUES = STATUS_OPTIONS.filter(o => o.value !== '').map(o => o.value)
export const STATUS_LABEL_MAP: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.filter(o => o.value !== '').map(o => [o.value, o.label])
)

@Injectable()
export class ArticleSearchService extends SearchService<Article> {
  override defaultModel = {
    keyword: '',
    status: '',
  }

  override extraModel = {
    type: 'article',
  }

  override pageNumKey = 'page'
  override pageSizeKey = 'size'

  override query() {
    // 模拟 API 调用 — 实际项目替换为真实请求
    return mockFetchArticles(this.getFormModel())
  }
}

// ===== 模拟数据 =====

const mockArticles: Article[] = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  title: `文章标题 ${i + 1}`,
  author: ['张三', '李四', '王五', '赵六'][i % 4]!,
  status: STATUS_VALUES[i % STATUS_VALUES.length]!,
  publishTime: new Date(2025, 0, 1 + (i % 200)).toISOString().slice(0, 10),
}))

async function mockFetchArticles(params: any): Promise<{
  total: number
  current: number
  size: number
  records: Article[]
}> {
  await new Promise(r => setTimeout(r, 300))

  let filtered = [...mockArticles]

  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      a => a.title.toLowerCase().includes(kw) || a.author.toLowerCase().includes(kw)
    )
  }

  if (params.status) {
    filtered = filtered.filter(a => a.status === params.status)
  }

  const page = params.page || params.currentPage || 1
  const size = params.size || params.limit || 20
  const start = (page - 1) * size

  return {
    total: filtered.length,
    current: page,
    size,
    records: filtered.slice(start, start + size),
  }
}
```

### `STATUS_OPTIONS` 和 `STATUS_LABEL_MAP` 模式说明

这两个常量遵循**单一数据源**原则：

- **`STATUS_OPTIONS`** — 定义一个 `as const` 数组，同时包含 `value` 和 `label`。用于 `<select>` 的 `<option>` 渲染。
- **`STATUS_LABEL_MAP`** — 从 `STATUS_OPTIONS` 自动推导出 `value → label` 的映射表。用于表格列表中把原始值转换为中文显示，无需硬编码 if/switch。

```ts
// 渲染下拉选项
<option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">
  {{ opt.label }}
</option>

// 渲染状态标签
{{ STATUS_LABEL_MAP[item.status] || item.status }}
```

当新增一个状态时，只需在 `STATUS_OPTIONS` 中添加一项，`STATUS_LABEL_MAP` 自动同步。

## 组件使用

```vue
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

// 分页按钮编号范围（最多显示 7 页）
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
  <div>
    <h1>搜索分页服务示例</h1>

    <!-- 搜索表单 -->
    <section>
      <div>
        <input
          v-model="search.model.keyword"
          placeholder="搜索文章标题或作者"
          @input="search.search()"
        />
        <select
          :value="search.model.status"
          @change="onStatusChange"
        >
          <option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <button @click="search.reset()">
          重置
        </button>
      </div>
    </section>

    <!-- 状态栏 -->
    <div>
      <span>
        共 <strong>{{ search.total }}</strong> 条
        <span v-if="search.loading">搜索中...</span>
      </span>
      <span v-if="search.error">{{ search.error }}</span>
    </div>

    <!-- 数据表格 -->
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>标题</th>
          <th>作者</th>
          <th>状态</th>
          <th>发布时间</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="search.list.length === 0 && !search.loading">
          <td colspan="5">暂无数据</td>
        </tr>
        <tr v-for="item in search.list" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.title }}</td>
          <td>{{ item.author }}</td>
          <td>
            <span :style="{
              background: item.status === 'published' ? '#e8f5e9' : item.status === 'draft' ? '#fff3e0' : '#f5f5f5',
              color: item.status === 'published' ? '#2e7d32' : item.status === 'draft' ? '#e65100' : '#999',
            }">
              {{ STATUS_LABEL_MAP[item.status] || item.status }}
            </span>
          </td>
          <td>{{ item.publishTime }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 分页 -->
    <div v-if="search.total > 0">
      <!-- 每页条数选择 -->
      <select :value="search.pageSize" @change="onPageSizeChange">
        <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
      </select>

      <!-- 分页按钮 -->
      <button :disabled="search.pageNum <= 1" @click="goToPage(1)">首页</button>
      <button :disabled="search.pageNum <= 1" @click="goToPage(search.pageNum - 1)">上一页</button>

      <button
        v-for="p in pageRange"
        :key="p"
        @click="goToPage(p)"
      >
        {{ p }}
      </button>

      <button :disabled="search.pageNum >= totalPages" @click="goToPage(search.pageNum + 1)">下一页</button>
      <button :disabled="search.pageNum >= totalPages" @click="goToPage(totalPages)">末页</button>
    </div>
  </div>
</template>
```

## 关键要点

### 1. 基类继承模式

`SearchService<T>` 是**不可直接实例化的基类**。实际使用的时候必须创建一个业务子类（如 `ArticleSearchService extends SearchService<Article>`），然后通过 `declareProviders([ArticleSearchService])` 和 `useService(ArticleSearchService)` 来消费。基类的 `query()` 方法直接 `throw new Error`，强制子类覆写。

**为什么不把 SearchService 设计成可直接使用的独立服务？**
因为不同业务场景的 API 端点、筛选字段、分页参数名各不相同。如果做成一个参数化的大杂烩服务，会让配置散落在各个使用点，难以维护且失去类型安全。继承模式让每个业务子类自成体系，类型明确（`SearchService<Article>`），配置集中在子类顶部。

### 2. model 表单绑定

不再使用扁平的 `keyword`、`status` 等独立属性。而是将所有用户可修改的筛选条件聚合到 `model` 对象中：

```ts
// 子类声明默认表单模型
override defaultModel = {
  keyword: '',
  status: '',
}

// 组件中绑定
v-model="search.model.keyword"
:value="search.model.status"
```

**优势**：新增筛选条件只需在 `defaultModel` 中加一个字段，基类的 `resetModel()`、`getFormModel()`、`saveModelToUrl()`、`queryFromUrl()` 全部自动覆盖。

### 3. model → API 参数的三层转换

基类通过三个转换器 map 实现了灵活的前后端字段映射：

- **`model2TOParserMap`** — `model` → API 请求参数。当前端表单字段名与后端接口参数名不同，或者一个前端字段需要映射成多个后端参数时使用。
- **`modelStringifierMap`** — 序列化到 URL 时的转换。如 `Date` 对象 → ISO 字符串。
- **`modelParserMap`** — 从 URL 反序列化时的转换。如 ISO 字符串 → `Date` 对象。

`ArticleSearchService` 未使用这些转换器，因为其 `model` 字段与 API 参数完全一致。实际项目中如遇到命名差异（例如前端叫 `createTimeRange`，后端需要 `startTime` 和 `endTime`），只需在子类中挂载 `model2TOParserMap` 即可：

```ts
override model2TOParserMap = {
  createTimeRange: (value: [string, string]) => ({
    startTime: value[0],
    endTime: value[1],
  }),
}
```

### 4. URL 持久化

搜索条件和分页位置通过 `RouterService` 自动同步到 URL query 参数中：

- **保存**：每次执行搜索时，`saveModelToUrl()` 将当前 `model` + `pageNum` + `pageSize` JSON 序列化后写入 URL 的 `q` 参数（由 `QUERY_KEY_FOR_MODEL` 控制）。
- **恢复**：`onMounted` 中调用 `queryFromUrl()`，从 URL 的 `q` 参数反序列化恢复所有表单值和分页位置。

这意味着用户刷新页面或分享链接后，搜索条件、当前页码全部不丢失。

### 5. 防抖与立即搜索

- **`search()` / `debouncedSearch()`** — 300ms 防抖。用于文本输入场景（如关键词搜索），用户连续输入时只触发最后一次。
- **`immediateSearch()`** — 无防抖，立即执行。用于下拉选择、复选框等离散操作，用户期望即时反馈。

在组件中，关键词输入框绑定 `@input="search.search()"`，状态下拉框绑定 `@change="onStatusChange"` 并内部调用 `search.immediateSearch()`。

### 6. 为什么不用 @autobind

基类中的方法（`search`、`reset`、`onPageChange`、`onPageSizeChange`、`queryFromUrl`）**均未使用 `@autobind` 装饰器**。

本库现在提供了 Vue 响应式兼容的 `@autobind` 装饰器，内部使用 `value.bind(reactive(this))` 绑定方法，确保 `this` 始终指向 reactive proxy，不会破坏响应式追踪。同时 `@autobind` 兼容 `@Raw` 装饰器，会检测 `context.metadata[RAW_CLASS_KEY]` 标记，在 `@Raw` 类中回退为普通绑定。

搜索服务选择不使用 `@autobind` 是出于风格偏好：箭头函数写法 `search = () => {}` 同样能保证 `this` 正确，且代码意图更直观。但如果需要在 `setTimeout`、`Promise.then` 等回调场景中保持 `this` 绑定，推荐使用本库提供的 `@autobind`。

Vue 组件中的事件处理遵循以下模式即可确保 `this` 正确：

```vue
<!-- 直接传递方法引用 — 安全，this 指向 reactive proxy -->
<input @input="search.search()" />

<!-- 需要传递参数的场景 — 用箭头函数或组件内方法包装 -->
<button @click="search.onPageChange(3)" />
<button @click="goToPage(3)" /> <!-- goToPage 内部调用 search.onPageChange(3) -->

<!-- 下拉框 — 先赋值 model，再立即搜索 -->
<select :value="search.model.status" @change="onStatusChange" />
```

### 7. 下拉框使用 `:value` + `@change` 而非 `v-model`

状态下拉框使用单向绑定 + 事件处理，而不是 `v-model="search.model.status"`：

```vue
<select
  :value="search.model.status"
  @change="onStatusChange"
>
```

**原因**：`v-model` 会自动修改 `search.model.status`，但不会触发搜索。我们希望在下拉值变化时执行 `immediateSearch()`（无防抖立即搜索），因此需要显式地在 `@change` 中先赋值再调用搜索。

输入框使用 `v-model="search.model.keyword"` 没问题，因为 `@input="search.search()"` 委托给服务方法的防抖逻辑处理。

### 8. `STATUS_OPTIONS` 和 `STATUS_LABEL_MAP` 模式

不是随意定义两个互相独立的数组和对象。`STATUS_LABEL_MAP` 必须从 `STATUS_OPTIONS` 推导生成，确保 **value/label 映射始终与下拉选项同步**。当需要新增状态时，只需修改一处：

```ts
// ✅ 正确：单一数据源
const STATUS_OPTIONS = [
  { value: 'published', label: '已发布' },
  { value: 'draft', label: '草稿' },
] as const
const STATUS_LABEL_MAP = Object.fromEntries(
  STATUS_OPTIONS.filter(o => o.value).map(o => [o.value, o.label])
)

// ❌ 错误：双重维护，容易不一致
const STATUS_OPTIONS = [...]
const STATUS_LABEL_MAP = { published: '已发布', draft: '草稿' } // 手动维护
```

### 9. 方法完整 API 速查

| 方法 | 签名 | 说明 |
|------|------|------|
| `search()` | `(): void` | 用户输入入口，300ms 防抖后搜索 |
| `debouncedSearch()` | `(): void` | 防抖搜索（等同于 `search()`） |
| `immediateSearch()` | `(): void` | 立即搜索，无防抖 |
| `reset()` | `(): void` | 重置页码、页大小、表单模型，然后搜索 |
| `onPageChange()` | `(pageNum: number): void` | 跳转到指定页 |
| `onPageSizeChange()` | `(pageSize: number): void` | 修改每页条数（自动回到第 1 页） |
| `queryFromUrl()` | `(): void` | 从 URL 恢复查询条件并执行搜索 |
| `getFormModel()` | `(): Record<string, any>` | 获取发送给 API 的完整参数（含 model 转换 + extraModel + 分页） |
| `resetModel()` | `(newModel?: Record<string, any>): void` | 重置模型（不传参则恢复 defaultModel） |
| `clearDebounce()` | `(): void` | 清除防抖定时器 |
| `dispose()` | `(): void` | `@PreDestroy` 生命周期，清除定时器 |
| `query()` | `(): Promise<PaginationResult<T> \| void>` | **子类必须覆写**，执行实际的 API 调用 |
