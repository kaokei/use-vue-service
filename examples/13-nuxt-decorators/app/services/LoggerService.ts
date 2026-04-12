/**
 * 日志服务
 *
 * 提供统一的日志输出能力，将被 CountService 通过 @Inject 注入
 */
export class LoggerService {
  /** 输出日志信息到控制台 */
  public log(...msg: any[]) {
    console.log('[LoggerService]', ...msg);
  }
}
