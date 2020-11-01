import { useService, declareProviders, Inject, Injectable } from '../../src';

import LoggerService from './logger.service';

@Injectable()
export default class CountService {
  public count = 0;

  public constructor(private loggerService: LoggerService) {}

  public add1() {
    this.count++;
    this.loggerService.log('this.count: ==>', this.count);
  }
}
