import { Inject, Injectable, Computed } from '@kaokei/use-vue-service';
import { LoggerService } from './LoggerService';

/**
 * 计数服务
 *
 * 演示在 Nuxt 项目中使用 DI 装饰器：
 * - @Injectable() 类装饰器：标记该类可被 DI 容器管理
 * - @Inject 属性装饰器：自动注入依赖服务
 * - @Computed getter 装饰器：声明计算属性
 */
@Injectable()
export class CountService {
  /** 当前计数值 */
  public count = 0;

  /** 通过 @Inject 装饰器自动注入 LoggerService */
  @Inject(LoggerService)
  public logger!: LoggerService;

  /** 计算属性：显示格式化的计数信息 */
  @Computed
  public get displayCount(): string {
    return `当前计数：${this.count}`;
  }

  /** 计数加一，并通过注入的 LoggerService 输出日志 */
  public increment() {
    this.count++;
    this.logger.log('increment ==>', this.count);
  }

  /** 重置计数 */
  public reset() {
    this.count = 0;
    this.logger.log('reset');
  }
}
