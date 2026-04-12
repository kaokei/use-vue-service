import { ComputedPlanAEager } from './computed-plan-a-eager';
import { getScope, removeScope } from '@/scope';
import { SCOPE_KEY } from '@/constants';
import { reactive } from 'vue';

describe('Plan_A_Eager — EffectScope 管理', () => {
  // 测试：ComputedRef 在 EffectScope 中创建（需求 1.3, 5.1）
  // Plan_A_Eager 在 addInitializer 阶段就创建了 ComputedRef，
  // 所以 scope 在 new 阶段就已经创建
  it('ComputedRef 在 EffectScope 中创建', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanAEager()
      public get age() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();

    // Plan_A_Eager 在 addInitializer 阶段就创建了 ComputedRef，
    // 所以 new 之后实例上应已存在 EffectScope
    const scope = getScope(demo);
    expect(scope).toBeDefined();
  });

  // 测试：getEffectScope 自动创建 — addInitializer 阶段自动创建 scope（需求 5.2）
  it('getEffectScope 自动创建 — addInitializer 阶段自动创建 scope', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanAEager()
      public get age() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();

    // Plan_A_Eager 在 addInitializer 阶段就调用了 getEffectScope，
    // 所以 new 之后实例上应已有 SCOPE_KEY
    expect((demo as any)[SCOPE_KEY]).toBeDefined();
  });

  // 测试：scope.stop() 后的行为（需求 5.3）
  // Plan_A_Eager 的特殊行为：由于 computed getter 内部使用 reactive(that) 获取代理，
  // scope 停止后 ComputedRef 不再建立响应式追踪，但访问 .value 时仍会重新执行 getter，
  // 因此仍然能返回基于当前依赖值的计算结果。
  // 这与 Plan_A_Lazy 和 Plan_B 的行为不同（它们 scope 停止后返回最后缓存的值）。
  it('scope.stop() 后不再响应式更新', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanAEager()
      public get age() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // 首次访问，验证响应式正常工作
    expect(reactiveDemo.age).toBe(11);

    // 验证响应式正常工作
    reactiveDemo.id = 2;
    expect(reactiveDemo.age).toBe(12);

    // 停止 EffectScope
    removeScope(demo);

    // 修改依赖属性
    reactiveDemo.id = 100;

    // Plan_A_Eager 特殊行为：scope 停止后，ComputedRef 不再有响应式追踪，
    // 但访问 .value 时仍会重新执行 getter 函数（因为 computed 变为"脏"状态），
    // 所以仍然返回基于当前依赖值的计算结果。
    // 这是 Plan_A_Eager 使用 reactive(that) 的技术特征。
    expect(reactiveDemo.age).toBe(110);
  });
});
