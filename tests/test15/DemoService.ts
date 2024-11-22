import { postReactive } from '../../src';

export class DemoService {
  public count = 1;

  public increaseCount() {
    this.count++;
  }

  @postReactive()
  public test1() {
    throw new Error('something wrong');
  }
}
