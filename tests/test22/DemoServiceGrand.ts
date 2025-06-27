import { DemoServiceBase } from './DemoServiceBase';

export class DemoServiceGrand extends DemoServiceBase {
  public count_grand = 1;

  public increaseCount() {
    this.count_grand++;
  }
}
