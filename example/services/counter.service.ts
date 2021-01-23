import { Injectable } from '@src/index';
import Logger from './logger.service';

function logDec(name: string) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const context: any = this;
      console.log('from logDec before: ', context[name]);
      originalMethod.apply(context, args);
      console.log('from logDec after: ', context[name]);
    };
  };
}

@Injectable()
export default class Counter {
  public count = 0;
  public age = 0;

  constructor(public logger: Logger) {}

  public add(num: number) {
    this.count += num;
    this.logger.log('this.count: ==>', this.count);
  }

  public minus(num: number) {
    this.count -= num;
    this.logger.log('this.count: ==>', this.count);
  }

  @logDec('count')
  public increment() {
    this.count++;
  }

  @logDec('count')
  public decrement() {
    this.count--;
  }

  @logDec('age')
  public incrementAge() {
    this.age++;
  }

  @logDec('age')
  public decrementAge() {
    this.age--;
  }
}
