/**
 * 开关服务
 *
 * 控制计数器和倒计时组件的背景色显示/隐藏。
 * 通过 @Inject 注入 LoggerService 来记录操作日志。
 */
import { Inject, Injectable } from '@kaokei/use-vue-service';
import { LoggerService } from './LoggerService';

@Injectable()
export class SwitchService {
  public counterStatus = 1;
  public countdownStatus = 1;

  @Inject(LoggerService)
  public logger!: LoggerService;

  public toggleCounterStatus() {
    this.counterStatus = (this.counterStatus + 1) % 2;
    this.logger.log('counterStatus ==>', this.counterStatus);
  }

  public toggleCountdownStatus() {
    this.countdownStatus = (this.countdownStatus + 1) % 2;
    this.logger.log('countdownStatus ==>', this.countdownStatus);
  }
}
