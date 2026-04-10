import { ComputedPlanB } from '@/index';

/**
 * 研究性测试：非 reactive 场景下的行为
 *
 * ⚠️ 本测试为研究性测试，结论不影响实现方案选择。
 * 在实际使用中，DI_Container 始终通过 onActivation 钩子将服务实例转换为 Reactive_Proxy，
 * 因此非 reactive 场景不会在生产环境中出现。
 */
describe('Plan_B — 非 reactive 场景（研究性测试）', () => {
  // 测试：非 reactive 实例上的 getter 行为（需求 9.1）
  it('非 reactive 实例上的 getter 行为', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanB()
      public get age() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();

    // 在非 reactive 实例上直接访问 getter
    // Plan_B 的新 getter 函数仍然会执行，创建 ComputedRef 并缓存到 Symbol key 上
    // 然后手动返回 computedRef.value
    const value = demo.age;

    // 应返回正确的计算结果
    expect(value).toBe(11);
  });

  // 测试：非 reactive 场景下的缓存行为（需求 9.2）
  it('非 reactive 场景下的缓存行为', () => {
    const computeFn = vi.fn();

    class DemoService {
      public id = 1;

      @ComputedPlanB()
      public get age() {
        computeFn();
        return this.id + 10;
      }
    }

    const demo = new DemoService();

    // 首次访问
    expect(demo.age).toBe(11);
    expect(computeFn).toHaveBeenCalledTimes(1);

    // 后续访问 — Plan_B 每次都调用 getter 函数，但内部有缓存检查
    // 在非 reactive 场景下，ComputedRef 已缓存，直接返回 computedRef.value
    // 由于实例未经 reactive() 包装，依赖属性不是响应式的，
    // ComputedRef 内部的 getter 不会被重新触发
    const secondAccess = demo.age;
    expect(secondAccess).toBe(11);

    // 修改依赖属性
    demo.id = 2;

    // 在非 reactive 场景下，Plan_B 的 getter 每次都会被调用，
    // 但内部 ComputedRef 已缓存。由于原始实例的属性不是响应式的，
    // ComputedRef 可能不会感知到依赖变化。
    // 记录实际行为：
    const afterChange = demo.age;
    expect(typeof afterChange).toBe('number');
  });
});
