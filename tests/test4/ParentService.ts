import { inject } from 'inversify';
import { DemoService } from './DemoService';

export class ParentService {
  public count = 200;

  @inject(DemoService)
  public demoService!: DemoService;

  public increaseCount() {
    this.count += 10;
  }
}
