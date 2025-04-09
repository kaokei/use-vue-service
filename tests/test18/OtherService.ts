import { Inject, LazyToken, TokenType } from '@/index';
import { TYPES } from './token';

export class OtherService {
  public count = 1;

  public increaseCount() {
    this.count++;
  }

  @Inject(new LazyToken(() => TYPES.DemoService))
  public demoService!: TokenType<typeof TYPES.DemoService>;
}
