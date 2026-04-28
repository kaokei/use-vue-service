import { LoggerService } from './LoggerService';

// 无需 import — Injectable、Inject、Computed 均由插件自动导入
@Injectable()
export class CountService {
  public count = 0;

  @Inject(LoggerService)
  public logger!: LoggerService;

  @Computed
  public get displayCount(): string {
    return `当前计数：${this.count}`;
  }

  public increment() {
    this.count++;
    this.logger.log('increment ==>', this.count);
  }

  public reset() {
    this.count = 0;
    this.logger.log('reset');
  }
}
