import { Injectable, Inject } from '@/index';
import { FIND_CHILD_SERVICE, FIND_CHILDREN_SERVICES } from '@/index';
import type { FindChildService, FindChildrenServices } from '@/index';

@Injectable()
export class DemoServiceWithInject {
  public count = 1;

  public increaseCount() {
    this.count++;
  }

  @Inject(FIND_CHILD_SERVICE)
  public findChild!: FindChildService;

  @Inject(FIND_CHILDREN_SERVICES)
  public findChildren!: FindChildrenServices;
}
