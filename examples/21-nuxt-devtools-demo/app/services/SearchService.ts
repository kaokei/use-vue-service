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
