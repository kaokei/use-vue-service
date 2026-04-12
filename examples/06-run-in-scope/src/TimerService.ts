import type { EffectScope } from 'vue';
import { watchEffect } from 'vue';
import { RunInScope } from '@kaokei/use-vue-service';

/**
 * 计时器服务
 *
 * 演示 @RunInScope 装饰器的核心功能：
 * - 被装饰的方法会在一个新的 EffectScope 中执行
 * - 方法内部的 watchEffect 等副作用会被该 scope 管理
 * - 调用 scope.stop() 即可一次性清理所有副作用
 */
export class TimerService {
  /** 计数器 */
  public count = 0;

  /** 日志记录，追踪 watchEffect 的执行情况 */
  public logs: string[] = [];

  /**
   * 启动监听
   *
   * @RunInScope 装饰器会：
   * 1. 创建一个新的 EffectScope（子 scope）
   * 2. 在该 scope 中执行方法体（包括 watchEffect）
   * 3. 返回该 EffectScope，用户可通过 scope.stop() 清理
   *
   * 注意：方法体内返回 void，但装饰器在运行时会将返回值替换为 EffectScope。
   * 这里使用 `return null as any` 占位，使调用侧能获得正确的类型推断。
   */
  @RunInScope
  public startWatch(): EffectScope {
    watchEffect(() => {
      // 每当 count 变化时，watchEffect 会重新执行
      this.logs.push(`[watchEffect] count 变为 ${this.count}`);
    });
    return null as any;
  }

  /** 递增计数器 */
  public increment() {
    this.count++;
  }
}
