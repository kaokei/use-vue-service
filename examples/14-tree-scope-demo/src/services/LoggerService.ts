/**
 * 日志服务
 *
 * 提供统一的日志输出方法，被其他服务通过 @Inject 注入使用。
 */
export class LoggerService {
  public log(...args: any[]) {
    console.log('[LoggerService]', ...args);
  }
}
