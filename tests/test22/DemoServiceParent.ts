import { DemoServiceGrand } from './DemoServiceGrand';

export class DemoServiceParent extends DemoServiceGrand {
  public count_parent = 1;

  public increaseCount() {
    this.count_parent++;
  }
}
