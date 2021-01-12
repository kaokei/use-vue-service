import { Injectable } from '../../src/Injectable';
import Logger from './Logger.service';

@Injectable()
export default class Counter {
  public count = 0;

  constructor(public logger: Logger) {}

  public add(num: number) {
    this.count += num;
  }

  public minus(num: number) {
    this.count -= num;
  }

  public increment() {
    this.count++;
  }

  public decrement() {
    this.count--;
  }
}
