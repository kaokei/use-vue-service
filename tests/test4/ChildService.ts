import { Inject } from '@/index';
import { ParentService } from './ParentService';
import { DemoService } from './DemoService';

export class ChildService {
  public count = 300;

  @Inject(ParentService)
  public parentService!: ParentService;

  @Inject(DemoService)
  public demoService!: DemoService;

  public increaseCount() {
    this.count += 100;
  }
}
