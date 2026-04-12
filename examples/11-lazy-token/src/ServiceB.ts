/**
 * 服务 B
 *
 * 演示通过 LazyToken 解决循环依赖：
 * - ServiceB 依赖 ServiceA，ServiceA 也依赖 ServiceB，形成循环引用
 * - 使用 @Inject(new LazyToken(() => ServiceA)) 延迟解析 ServiceA 的引用
 * - 两个服务都使用 LazyToken，确保无论哪个先被加载都不会出现引用错误
 *
 * 凡是使用了 @Inject 等成员装饰器的类，都需要添加 @Injectable() 类装饰器，
 * 以确保 DI 容器能正确读取注入元数据。
 */
import { Inject, Injectable, LazyToken } from '@kaokei/use-vue-service';
import { ServiceA } from './ServiceA';

@Injectable()
export class ServiceB {
  /** 服务名称 */
  public name = 'ServiceB';

  /** 通过 LazyToken 延迟注入 ServiceA，避免循环引用 */
  @Inject(new LazyToken(() => ServiceA))
  public serviceA!: ServiceA;

  /** 获取自我介绍，同时展示对 ServiceA 的访问 */
  public getGreeting(): string {
    return `我是 ${this.name}，我依赖的服务是 ${this.serviceA.name}`;
  }
}
