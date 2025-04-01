import { Inject, LazyToken, TokenType } from '@kaokei/di';
import { TYPES } from './token';

export class DemoService {
  public count = 1;

  public increaseCount() {
    this.count++;
  }

  @Inject(new LazyToken(() => TYPES.OtherService))
  public otherService!: TokenType<typeof TYPES.OtherService>;
}
