import { useService, declareProviders, Inject, Injectable } from '../../src';

@Injectable()
export default class LoggerService {
  public constructor() {}

  public log(...args: any[]) {
    console.log('log service :>> ', ...args);
  }
}
