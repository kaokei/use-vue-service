import { Inject } from '@kaokei/di';
import { OtherService } from './OtherService';

export class DemoServiceBase {
  public count_base = 1;

  @Inject(OtherService)
  public otherService!: OtherService;

  public increaseCount() {
    this.count_base++;
  }
}
