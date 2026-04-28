import type { EffectScope } from 'vue';
import { watchEffect } from 'vue';
import { Injectable, PostConstruct } from '@kaokei/use-vue-service';
import { RunInScope } from '@kaokei/use-vue-service';

/**
 * 价格服务
 *
 * 演示 @PostConstruct 与 @RunInScope 的配合用法：
 * 在 @PostConstruct 方法内调用 @RunInScope 装饰的 startWatch()，
 * 使得 useService 获取实例时响应式监听已自动建立，无需组件手动触发。
 */
@Injectable()
export class PriceService {
  /** 商品单价 */
  public unitPrice = 100;

  /** 数量 */
  public quantity = 1;

  /** 总价（由 watchEffect 自动计算并更新） */
  public total = 0;

  /** 监听日志 */
  public logs: string[] = [];

  /** 保存 EffectScope，供外部按需停止监听 */
  public scope: EffectScope | null = null;

  /**
   * 建立响应式监听：自动计算总价并记录日志。
   * @RunInScope 装饰器将方法体包裹在独立的 EffectScope 中执行，
   * 并返回该 EffectScope。
   */
  @RunInScope
  public startWatch(): EffectScope {
    watchEffect(() => {
      this.total = this.unitPrice * this.quantity;
      this.logs.push(
        `[watchEffect] 单价=${this.unitPrice}，数量=${this.quantity}，总价=${this.total}`
      );
    });
    return null as unknown as EffectScope;
  }

  /**
   * 服务实例化完成后自动执行。
   * 在此处调用 startWatch()，监听从 useService 拿到实例的那一刻起就已建立。
   */
  @PostConstruct()
  public init() {
    this.scope = this.startWatch();
  }

  /** 停止监听，之后修改数据不再触发 watchEffect */
  public stopWatch() {
    if (this.scope) {
      this.scope.stop();
      this.scope = null;
      this.logs.push('[scope.stop] 已停止监听');
    }
  }
}
