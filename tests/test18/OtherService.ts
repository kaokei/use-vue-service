import { inject, LazyServiceIdentifier } from 'inversify';
import { TYPES } from './token';
import { ExtractToken } from '../../src/inversify';

export class OtherService {
  public count = 1;

  public increaseCount() {
    this.count++;
  }

  @inject(new LazyServiceIdentifier(() => TYPES.DemoService))
  public demoService!: ExtractToken<typeof TYPES.DemoService>;
}
