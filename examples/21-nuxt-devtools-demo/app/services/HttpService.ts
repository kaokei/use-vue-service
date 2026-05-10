import { Injectable, Raw } from '@kaokei/use-vue-service'

interface FetchConfig {
  headers?: Record<string, string>
  params?: Record<string, any>
}

@Raw()
@Injectable()
export class HttpService {
  baseURL = ''

  commonHeaders: Record<string, string> = {}

  setBaseURL(url: string): void {
    this.baseURL = url
  }

  setHeader(key: string, value: string): void {
    this.commonHeaders[key] = value
  }

  removeHeader(key: string): void {
    delete this.commonHeaders[key]
  }

  async get<T = any>(url: string, config?: FetchConfig): Promise<T> {
    return this.request<T>(url, { method: 'GET', ...config })
  }

  async post<T = any>(url: string, body?: any, config?: FetchConfig): Promise<T> {
    return this.request<T>(url, { method: 'POST', body, ...config })
  }

  async put<T = any>(url: string, body?: any, config?: FetchConfig): Promise<T> {
    return this.request<T>(url, { method: 'PUT', body, ...config })
  }

  async delete<T = any>(url: string, config?: FetchConfig): Promise<T> {
    return this.request<T>(url, { method: 'DELETE', ...config })
  }

  // 统一请求入口，合并公共请求头
  private async request<T>(
    url: string,
    config: FetchConfig & { method: string; body?: any }
  ): Promise<T> {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`

    const mergedHeaders: Record<string, string> = {
      ...this.commonHeaders,
      ...config.headers,
    }

    return $fetch<T>(fullURL, {
      method: config.method as any,
      headers: mergedHeaders,
      body: config.body,
      params: config.params,
    })
  }
}
