import 'reflect-metadata';
import { Injectable } from '../../src/Injectable';

@Injectable()
export default class Logger {
  log(...msg: any[]) {
    console.log('from logger ==> ', ...msg);
  }
}
