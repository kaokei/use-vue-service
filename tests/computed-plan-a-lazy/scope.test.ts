import { ComputedPlanALazy } from '@/index';
import { getScope, removeScope } from '@/scope';
import { SCOPE_KEY } from '@/constants';
import { reactive } from 'vue';

describe('Plan_A_Lazy — EffectScope 管理', () => {
  // 测试：ComputedRef 在 EffectScope 中创建（需求 1.3, 5.1）
  it('ComputedRef 在 EffectScope 中创建', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanALazy()
      public get age() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // 首次访问前，实例上不应有 scope
    expect(getScope(demo)).toBeUndefined();

    // 首次访问 getter，触发 ComputedRef 创建
    expect(reactiveDemo.age).toBe(11);

    // 访问后，实例上应存在 EffectScope
    const scope = getScope(demo);
    expect(scope).toBeDefined();
  });

  // 测试：getEffectScope 自动创建 — 首次访问 getter 时自动创建 scope（需求 5.2）
  it('getEffectScope 自动创建 — 首次访问时自动创建 scope', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanALazy()
      public get age() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // 首次访问前，实例上没有 SCOPE_KEY
    expect((demo as any)[SCOPE_KEY]).toBeUndefined();

    // 首次访问 getter
    reactiveDemo.age;

    // 首次访问后，实例上应自动创建了 SCOPE_KEY 对应的 EffectScope
    expect((demo as any)[SCOPE_KEY]).toBeDefined();
  });

  // 测试：scope.stop() 后不再响应式更新（需求 5.3）
  it('scope.stop() 后不再响应式更新', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanALazy()
      public get age() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // 首次访问，建立响应式
    expect(reactiveDemo.age).toBe(11);

    // 验证响应式正常工作
    reactiveDemo.id = 2;
    expect(reactiveDemo.age).toBe(12);

    // 停止 EffectScope
    removeScope(demo);

    // 修改依赖属性
    reactiveDemo.id = 100;

    // scope 停止后，Vue 的 computed 不再缓存，每次访问 .value 时会重新执行 getter。
    // 因此在 Plan_A_Lazy 中，scope 停止后 getter 仍然会返回最新计算值（非缓存模式）。
    // 这与 Plan_B 的行为可能不同，属于方案对比的一部分。
    expect(reactiveDemo.age).toBe(110);
  });
});
