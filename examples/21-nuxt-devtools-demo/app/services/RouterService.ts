import { Injectable } from '@kaokei/use-vue-service'

@Injectable()
export class RouterService {
  router: any = null
  _route: any = null

  setRouter(router: any, route?: any) {
    this.router = router
    if (route) this._route = route
  }

  get currentQuery(): Record<string, any> {
    return this._route?.query || this.router?.currentRoute?.value?.query || {}
  }

  updateQuery(query: Record<string, any>) {
    const current = { ...this.currentQuery }
    const merged = { ...current, ...query }

    // 清除 null/undefined 值
    for (const key of Object.keys(merged)) {
      if (merged[key] == null) {
        delete merged[key]
      }
    }

    this.router?.replace({ query: merged })
  }
}
