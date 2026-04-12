/**
 * 计数服务
 *
 * 一个简单的服务类，用于演示路由组件中的依赖注入。
 * 每个路由组件通过 declareProviders 声明自己的 CountService 实例，
 * 切换路由时组件销毁，对应的服务实例也会被销毁，实现组件级作用域隔离。
 */
export class CountService {
  /** 当前计数值 */
  public count = 0;

  /** 计数加一 */
  public increment() {
    this.count++;
  }
}
