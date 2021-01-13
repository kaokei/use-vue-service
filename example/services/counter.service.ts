import { Injectable } from '../../src/Injectable';
import Logger from './logger.service';

function logDec(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  target[key] = function (...args: any[]) {
    console.log('from logDec before: ', this.count);
    originalMethod.apply(this, args);
    console.log('from logDec after: ', this.count);
  };
}

@Injectable()
export default class Counter {
  public count = 0;

  constructor(public logger: Logger) {}

  @logDec
  public add(num: number) {
    this.count += num;
    this.logger.log('this.count: ==>', this.count);
  }

  public minus(num: number) {
    this.count -= num;
    this.logger.log('this.count: ==>', this.count);
  }

  public increment() {
    this.count++;
    this.logger.log('this.count: ==>', this.count);
  }

  public decrement() {
    this.count--;
    this.logger.log('this.count: ==>', this.count);
  }
}
