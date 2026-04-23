import { Injectable, RunInScope } from '@/index';
import { watchEffect } from 'vue';
import type { EffectScope } from 'vue';

@Injectable()
export class DemoService {
  public count = 0;

  public setupCallCount = 0;

  @RunInScope
  public setup(): EffectScope {
    watchEffect(() => {
      void this.count;
      this.setupCallCount++;
    });
    return null as unknown as EffectScope;
  }
}
