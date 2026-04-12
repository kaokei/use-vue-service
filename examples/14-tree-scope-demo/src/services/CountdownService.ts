/**
 * 倒计时服务
 *
 * 提供倒计时功能，支持增减时间和自动倒计时。
 * 通过 @Inject 注入 LoggerService 来记录操作日志。
 */
import { Inject, Injectable } from '@kaokei/use-vue-service';
import { LoggerService } from './LoggerService';

@Injectable()
export class CountdownService {
  public remainTime = 0;
  public timer?: number;

  @Inject(LoggerService)
  public logger!: LoggerService;

  public add(num: number) {
    this.remainTime += num;
    this.startTimer();
    this.logger.log('remainTime add ==>', this.remainTime);
  }

  public minus(num: number) {
    this.remainTime -= num;
    if (this.remainTime < 0) {
      this.remainTime = 0;
    }
    this.logger.log('remainTime minus ==>', this.remainTime);
  }

  public get time() {
    let rt = this.remainTime;
    const ss = rt % 60;
    rt = (rt - ss) / 60;
    const mm = rt % 60;
    const hh = (rt - mm) / 60;
    return `${this.fmt(hh)}:${this.fmt(mm)}:${this.fmt(ss)}`;
  }

  private fmt(num: number) {
    return num < 10 ? `0${num}` : num;
  }

  public startTimer() {
    this.stopTimer();
    this.timer = window.setInterval(() => {
      if (this.remainTime > 0) {
        this.remainTime -= 1;
      } else {
        this.stopTimer();
      }
    }, 1000);
  }

  public stopTimer() {
    window.clearInterval(this.timer);
  }
}
