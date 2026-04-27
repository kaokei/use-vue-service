import { Computed as ComputedPlanALazy } from '@/index';

/**
 * 研究性测试：非 reactive 场景下的行为
 *
 * ⚠️ 本测试为研究性测试，结论不影响实现方案选择。
 * 在实际使用中，DI_Container 始终通过 onActivation 钩子将服务实例转换为 Reactive_Proxy，
 * 因此非 reactive 场景不会在生产环境中出现。
 *
 * 非 reactive 场景下，首次和后续访问均返回 ComputedRef 对象本身（无 Auto_Unwrap）。
 */
describe('Plan_A_Lazy — 非 reactive 场景（研究性测试）', () => {
  // 测试：非 reactive 实例上的 getter 行为（需求 9.1）
  it('非 reactive 实例上的 getter 行为', async () => {
    class DemoService {
      public id = 1;

      @ComputedPlanALazy()
      public get age() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();

    // 在非 reactive 实例上直接访问 getter
    // 装饰器返回的新 getter 仍然会执行，创建 ComputedRef 并赋值为同名数据属性
    // 非 reactive 场景无 Auto_Unwrap，首次返回 ComputedRef 对象本身
    const { isRef } = await import('vue');
    const value = demo.age;

    expect(isRef(value)).toBe(true);
  });

  // 测试：非 reactive 场景下的缓存行为（需求 9.2）
  it('非 reactive 场景下的缓存行为', async () => {
    const computeFn = vi.fn();

    class DemoService {
      public id = 1;

      @ComputedPlanALazy()
      public get age() {
        computeFn();
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const { isRef } = await import('vue');

    // 首次访问：非 reactive 场景无 Auto_Unwrap，返回 ComputedRef 对象本身
    // ComputedRef 是懒计算，仅创建但未求值，computeFn 尚未被调用
    expect(isRef(demo.age)).toBe(true);
    expect(computeFn).toHaveBeenCalledTimes(0);

    // 后续访问 — 数据属性是 ComputedRef 对象，同样无 Auto_Unwrap
    const secondAccess = demo.age;
    expect(secondAccess).toBeDefined();

    // 修改依赖属性
    demo.id = 2;

    // 后续访问仍然返回 ComputedRef 对象本身
    const afterChange = demo.age;
    expect(isRef(afterChange)).toBe(true);
  });
});
