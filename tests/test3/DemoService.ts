import { inject, LazyServiceIdentifier } from '@kaokei/di';
import { OtherService } from './OtherService';

export class DemoService {
  public count = 100;

  @inject(new LazyServiceIdentifier(() => OtherService))
  public otherService!: OtherService;

  public get sum() {
    return this.count + this.otherService.count;
  }

  public increaseCount() {
    this.count++;
  }
}
