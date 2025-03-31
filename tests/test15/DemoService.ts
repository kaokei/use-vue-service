import { PostConstruct } from '@kaokei/di';

export class DemoService {
  public count = 1;

  public increaseCount() {
    this.count++;
  }

  @PostConstruct()
  public test1() {
    throw new Error('something wrong');
  }
}
