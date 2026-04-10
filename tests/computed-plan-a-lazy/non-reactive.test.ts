import { ComputedPlanALazy } from '@/index';

/**
 * 研究性测试：非 reactive 场景下的行为
 *
 * ⚠️ 本测试为研究性测试，结论不影响实现方案选择。
 * 在实际使用中，DI_Container 始终通过 onActivation 钩子将服务实例转换为 Reactive_Proxy，
 * 因此非 reactive 场景不会在生产环境中出现。
 */
describe('Plan_A_Lazy — 非 reactive 场景（研究性测试）', () => {
  // 测试：非 reactive 实例上的 getter 行为（需求 9.1）
  it('非 reactive 实例上的 getter 行为', () => {
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
    const value = demo.age;

    // 应返回正确的计算结果
    expect(value).toBe(11);
  });

  // 测试：非 reactive 场景下的缓存行为（需求 9.2）
  it('非 reactive 场景下的缓存行为', () => {
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

    // 首次访问
    expect(demo.age).toBe(11);
    expect(computeFn).toHaveBeenCalledTimes(1);

    // 后续访问 — 在非 reactive 场景下，ComputedRef 已创建为数据属性
    // 但由于没有 reactive 代理，不会自动解包，行为可能与 reactive 场景不同
    // 记录实际行为
    const secondAccess = demo.age;
    expect(secondAccess).toBeDefined();

    // 修改依赖属性
    demo.id = 2;

    // 在非 reactive 场景下，Plan_A_Lazy 的新 getter 会在首次访问时创建 ComputedRef
    // 并将其赋值为同名数据属性。后续访问时直接读取数据属性。
    // 由于实例未经 reactive() 包装，ComputedRef 不会被自动解包，
    // 但数据属性覆盖了 getter，后续访问的行为取决于 ComputedRef 内部的响应式追踪。
    // 在非 reactive 场景下，原始实例的属性不是响应式的，
    // 但 ComputedRef 内部通过 getter 函数直接读取 this.id，
    // 所以行为可能因实现而异。
    const afterChange = demo.age;

    // 记录实际行为：
    // 在非 reactive 场景下，Plan_A_Lazy 首次访问后通过 Object.defineProperty
    // 在实例上创建了同名数据属性（值为 ComputedRef 对象）。
    // 后续访问 demo.age 直接读取该数据属性，由于没有 reactive 代理的 Auto_Unwrap，
    // 返回的是 ComputedRef 对象本身而非解包后的值。
    expect(typeof afterChange).toBe('object');
  });
});
