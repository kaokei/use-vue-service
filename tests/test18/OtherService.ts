import { Inject, LazyToken } from '@kaokei/di';
import { TYPES } from './token';
import type { TokenType } from '@/index';

export class OtherService {
  public count = 1;

  public increaseCount() {
    this.count++;
  }

  @Inject(new LazyToken(() => TYPES.DemoService))
  public demoService!: TokenType<typeof TYPES.DemoService>;
}
