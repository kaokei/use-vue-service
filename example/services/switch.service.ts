import { Injectable } from '@src/index';
import Logger from './logger.service';

@Injectable()
export default class SwitchService {
  public counterStatus = 1;
  public countdownStatus = 1;

  constructor(public logger: Logger) {}

  public toggleCounterStatus() {
    this.counterStatus = (this.counterStatus + 1) % 2;
    this.logger.log('this.counterStatus: ==>', this.counterStatus);
  }

  public toggleCountdownStatus() {
    this.countdownStatus = (this.countdownStatus + 1) % 2;
    this.logger.log('this.countdownStatus: ==>', this.countdownStatus);
  }
}
