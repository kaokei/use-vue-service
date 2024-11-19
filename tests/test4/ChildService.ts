import { inject } from 'inversify';
import { ParentService } from './ParentService';
import { DemoService } from './DemoService';

export class ChildService {
  public count = 300;

  @inject(ParentService)
  public parentService!: ParentService;

  @inject(DemoService)
  public demoService!: DemoService;

  public increaseCount() {
    this.count += 100;
  }
}
