/**
 * 日志服务
 *
 * 一个简单的日志服务，提供 log 方法用于输出日志信息。
 * 该服务将被 CountService 通过 @Inject 装饰器注入。
 */
export class LoggerService {
  /** 输出日志信息到控制台 */
  public log(...msg: any[]) {
    console.log('[LoggerService]', ...msg);
  }
}
