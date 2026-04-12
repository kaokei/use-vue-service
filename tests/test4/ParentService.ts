import { Inject, Injectable } from '@/index';
import { DemoService } from './DemoService';

@Injectable()
export class ParentService {
  public count = 200;

  @Inject(DemoService)
  public demoService!: DemoService;

  public increaseCount() {
    this.count += 10;
  }
}
