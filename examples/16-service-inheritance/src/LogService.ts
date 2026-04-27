/**
 * 日志服务——被注入到 BaseService 中，演示跨继承层级访问注入依赖。
 */
export class LogService {
  public logs: string[] = [];

  public log(message: string) {
    this.logs.push(`[${new Date().toLocaleTimeString()}] ${message}`);
  }
}
