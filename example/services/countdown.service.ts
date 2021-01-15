import { Injectable } from '@src/index';
import Logger from './logger.service';

@Injectable()
export default class Countdown {
  public remainTime = 0;
  public timer?: number;

  constructor(public logger: Logger) {}

  public add(num: number) {
    this.remainTime += num;
    this.startTimer();
    this.logger.log('this.remainTime: ==>', this.remainTime);
  }

  public minus(num: number) {
    this.remainTime -= num;
    if (this.remainTime < 0) {
      this.remainTime = 0;
    }
    this.logger.log('this.remainTime: ==>', this.remainTime);
  }

  public get time() {
    let rt = this.remainTime;
    const ss = rt % 60;
    rt = (rt - ss) / 60;
    const mm = rt % 60;
    const hh = (rt - mm) / 60;
    return `${this.fmt(hh)}:${this.fmt(mm)}:${this.fmt(ss)}`;
  }

  public fmt(num: number) {
    return num < 10 ? `0${num}` : num;
  }

  public startTimer() {
    if (this.timer) {
      return;
    }
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
