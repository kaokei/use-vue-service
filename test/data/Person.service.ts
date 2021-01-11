import 'reflect-metadata';
import { Injectable } from '../../src/Injectable';

@Injectable()
export default class Person {
  constructor(public name: string, public age: number) {}
}
