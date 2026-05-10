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
