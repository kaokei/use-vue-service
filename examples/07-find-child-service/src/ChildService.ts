/**
 * 子组件服务
 *
 * 一个简单的服务类，包含 name 属性和 greet() 方法。
 * 每个子组件会声明自己的 ChildService 实例，并设置不同的 name。
 */
export class ChildService {
  // 子组件的名称，每个子组件实例会设置不同的值
  public name = '默认名称';

  // 返回问候语
  public greet(): string {
    return `你好，我是 ${this.name}`;
  }
}
