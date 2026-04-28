import type { EffectScope } from 'vue';
import { watchEffect } from 'vue';
import { Injectable, PostConstruct } from '@/index';
import { RunInScope } from '@/index';

/**
 * 演示 @PostConstruct 内部调用 @RunInScope 装饰的方法，
 * 在服务实例化完成时自动建立响应式监听，无需外部手动调用。
 */
@Injectable()
export class WatchService {
  public count = 0;

  /** 记录 watchEffect 执行次数 */
  public watchCallCount = 0;

  /** 保存 @RunInScope 返回的 EffectScope，供外部按需 stop */
  public scope: EffectScope | null = null;

  /**
   * 被 @RunInScope 装饰的方法：
   * 方法体内的 watchEffect 会被收集到一个新的 Child_Scope 中。
   * 装饰器在运行时将返回值替换为该 EffectScope。
   */
  @RunInScope
  public startWatch(): EffectScope {
    watchEffect(() => {
      void this.count;
      this.watchCallCount++;
    });
    return null as unknown as EffectScope;
  }

  /**
   * 在实例化完成后自动调用 startWatch()，
   * 将返回的 EffectScope 保存到 this.scope，
   * 实现"useService 即监听"的效果。
   */
  @PostConstruct()
  public init() {
    this.scope = this.startWatch();
  }
}
