import { Inject, LazyToken } from '@kaokei/di';
import { OtherService } from './OtherService';

export class DemoService {
  public count = 100;

  @Inject(new LazyToken(() => OtherService))
  public otherService!: OtherService;

  public get sum() {
    return this.count + this.otherService.count;
  }

  public increaseCount() {
    this.count++;
  }
}
