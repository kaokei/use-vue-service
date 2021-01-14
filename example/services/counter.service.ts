import { Injectable } from '@src/index';
import Logger from './logger.service';

function logDec(target: any, key: string, descriptor: PropertyDescriptor) {
  console.log('logDec start :>> ');
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context: any = this;
    console.log('from logDec before: ', context.count);
    originalMethod.apply(context, args);
    console.log('from logDec after: ', context.count);
  };
}

@Injectable()
export default class Counter {
  public count = 0;

  constructor(public logger: Logger) {}

  public add(num: number) {
    this.count += num;
    this.logger.log('this.count: ==>', this.count);
  }

  public minus(num: number) {
    this.count -= num;
    this.logger.log('this.count: ==>', this.count);
  }

  @logDec
  public increment() {
    this.count++;
  }

  @logDec
  public decrement() {
    this.count--;
  }
}
