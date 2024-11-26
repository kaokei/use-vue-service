import { inject, LazyServiceIdentifier } from 'inversify';
import { TYPES } from './token';
import { ExtractToken } from '../../src/inversify';

export class DemoService {
  public count = 1;

  public increaseCount() {
    this.count++;
  }

  @inject(new LazyServiceIdentifier(() => TYPES.OtherService))
  public otherService!: ExtractToken<typeof TYPES.OtherService>;
}
