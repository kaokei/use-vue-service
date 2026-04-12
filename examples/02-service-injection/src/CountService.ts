/**
 * 计数服务
 *
 * 演示通过 @Inject 装饰器注入依赖服务。
 * CountService 依赖 LoggerService，DI 容器会自动解析并注入 LoggerService 实例。
 *
 * 使用 @Injectable() 类装饰器是必须的——凡是使用了 @Inject 等成员装饰器的类，
 * 都需要添加 @Injectable() 以确保 DI 容器能正确读取注入元数据。
 */
import { Inject, Injectable } from '@kaokei/use-vue-service';
import { LoggerService } from './LoggerService';

@Injectable()
export class CountService {
  /** 当前计数值 */
  public count = 0;

  /** 通过 @Inject 装饰器注入 LoggerService，使用 Stage 3 auto-accessor 语法 */
  @Inject(LoggerService)
  accessor logger!: LoggerService;

  /** 计数加一，并通过注入的 LoggerService 输出日志 */
  public addOne() {
    this.count++;
    this.logger.log('addOne ==>', this.count);
  }
}
