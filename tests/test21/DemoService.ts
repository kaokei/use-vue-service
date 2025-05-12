import { Computed } from '@/index';

export class DemoService {
  public count = 1;

  public increaseCount() {
    this.count++;
  }

  @Computed
  public get sum() {
    return this.count + 100;
  }
}
