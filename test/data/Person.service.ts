import { Injectable } from '../../src/Injectable';
import Logger from './Logger.service';

@Injectable()
export default class Person {
  constructor(public name: string, public age: number, public logger: Logger) {}
}
