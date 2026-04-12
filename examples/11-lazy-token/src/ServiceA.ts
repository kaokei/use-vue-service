/**
 * 服务 A
 *
 * 演示通过 LazyToken 解决循环依赖：
 * - ServiceA 依赖 ServiceB，ServiceB 也依赖 ServiceA，形成循环引用
 * - 使用 @Inject(new LazyToken(() => ServiceB)) 延迟解析 ServiceB 的引用
 * - LazyToken 接收一个工厂函数，在实际解析时才调用，避免模块加载时的循环引用问题
 *
 * 凡是使用了 @Inject 等成员装饰器的类，都需要添加 @Injectable() 类装饰器，
 * 以确保 DI 容器能正确读取注入元数据。
 */
import { Inject, Injectable, LazyToken } from '@kaokei/use-vue-service';
import { ServiceB } from './ServiceB';

@Injectable()
export class ServiceA {
  /** 服务名称 */
  public name = 'ServiceA';

  /** 通过 LazyToken 延迟注入 ServiceB，避免循环引用 */
  @Inject(new LazyToken(() => ServiceB))
  public serviceB!: ServiceB;

  /** 获取自我介绍，同时展示对 ServiceB 的访问 */
  public getGreeting(): string {
    return `我是 ${this.name}，我依赖的服务是 ${this.serviceB.name}`;
  }
}
