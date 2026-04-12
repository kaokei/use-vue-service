/**
 * 计数器服务
 *
 * 提供 count 和 age 两个计数属性，以及对应的增减方法。
 * 通过 @Inject 注入 LoggerService 来记录操作日志。
 */
import { Inject, Injectable } from '@kaokei/use-vue-service';
import { LoggerService } from './LoggerService';

@Injectable()
export class CounterService {
  public count = 0;
  public age = 0;

  @Inject(LoggerService)
  public logger!: LoggerService;

  public increment() {
    this.count++;
    this.logger.log('count increment ==>', this.count);
  }

  public decrement() {
    this.count--;
    this.logger.log('count decrement ==>', this.count);
  }

  public incrementAge() {
    this.age++;
    this.logger.log('age increment ==>', this.age);
  }

  public decrementAge() {
    this.age--;
    this.logger.log('age decrement ==>', this.age);
  }
}
