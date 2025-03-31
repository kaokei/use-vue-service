import { Inject } from '@kaokei/di';
import { DemoService } from './DemoService';

export class ParentService {
  public count = 200;

  @Inject(DemoService)
  public demoService!: DemoService;

  public increaseCount() {
    this.count += 10;
  }
}
