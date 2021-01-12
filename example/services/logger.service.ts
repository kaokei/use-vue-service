import { Injectable } from '../../src';

@Injectable()
export default class LoggerService {
  public log(...args: any[]) {
    console.log('log service :>> ', ...args);
  }
}
