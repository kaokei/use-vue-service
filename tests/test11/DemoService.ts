import { Inject, Injectable } from '@/index';
import { TYPES } from './router';

@Injectable()
export class DemoService {
  public count = 1;

  public increaseCount() {
    this.count++;
  }

  @Inject(TYPES.route)
  public route: any;

  @Inject(TYPES.router)
  public router: any;
}
