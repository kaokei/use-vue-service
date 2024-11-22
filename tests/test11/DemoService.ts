import { inject } from 'inversify';
import { TYPES } from './router';

export class DemoService {
  public count = 1;

  public increaseCount() {
    this.count++;
  }

  @inject(TYPES.route)
  public route: any;

  @inject(TYPES.router)
  public router: any;
}
