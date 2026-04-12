/**
 * 计数服务
 *
 * 一个简单的服务类，演示如何定义服务并通过 declareProviders 声明、useService 获取实例。
 * 服务实例会被 Vue 的 reactive 包装，因此属性变更会自动触发视图更新。
 */
export class CountService {
  /** 当前计数值 */
  public count = 0;

  /** 计数加一 */
  public addOne() {
    this.count++;
  }
}
