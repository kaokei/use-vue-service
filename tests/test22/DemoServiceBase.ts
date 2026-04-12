import { Inject, Injectable } from '@kaokei/di';
import { OtherService } from './OtherService';

@Injectable()
export class DemoServiceBase {
  public count_base = 1;

  @Inject(OtherService)
  public otherService!: OtherService;

  public increaseCount() {
    this.count_base++;
  }
}
