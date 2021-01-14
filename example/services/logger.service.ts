import { Injectable } from '@src/index';

@Injectable()
export default class LoggerService {
  public log(...args: any[]) {
    console.log('log service :>> ', ...args);
  }
}
