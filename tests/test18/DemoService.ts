import { Inject, Injectable, LazyToken, TokenType } from '@/index';
import { TYPES } from './token';

@Injectable()
export class DemoService {
  public count = 1;

  public increaseCount() {
    this.count++;
  }

  @Inject(new LazyToken(() => TYPES.OtherService))
  public otherService!: TokenType<typeof TYPES.OtherService>;
}
