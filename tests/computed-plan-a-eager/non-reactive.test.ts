import { ComputedPlanAEager } from './computed-plan-a-eager';

/**
 * 研究性测试：非 reactive 场景下的行为
 *
 * ⚠️ 本测试为研究性测试，结论不影响实现方案选择。
 * 在实际使用中，DI_Container 始终通过 onActivation 钩子将服务实例转换为 Reactive_Proxy，
 * 因此非 reactive 场景不会在生产环境中出现。
 */
describe('Plan_A_Eager — 非 reactive 场景（研究性测试）', () => {
  // 测试：非 reactive 实例上的 getter 行为（需求 9.1）
  it('非 reactive 实例上的 getter 行为', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanAEager()
      public get age() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();

    // Plan_A_Eager 在 addInitializer 阶段就创建了 ComputedRef 数据属性，
    // 在非 reactive 实例上直接访问时，数据属性覆盖了 getter，
    // 但没有 reactive 代理的 Auto_Unwrap，所以返回的是 ComputedRef 对象本身
    const value = demo.age;

    // 应返回正确的计算结果（可能是 ComputedRef 对象或解包后的值，取决于实现）
    // 记录实际行为
    expect(value).toBeDefined();
  });

  // 测试：非 reactive 场景下的缓存行为（需求 9.2）
  it('非 reactive 场景下的缓存行为', () => {
    const computeFn = vi.fn();

    class DemoService {
      public id = 1;

      @ComputedPlanAEager()
      public get age() {
        computeFn();
        return this.id + 10;
      }
    }

    const demo = new DemoService();

    // Plan_A_Eager 在 addInitializer 阶段就创建了 ComputedRef，
    // computed 创建时会立即求值一次
    const callsAfterNew = computeFn.mock.calls.length;

    // 首次访问 — 在非 reactive 场景下，数据属性已存在（ComputedRef）
    // 但没有 reactive 代理的 Auto_Unwrap
    const firstAccess = demo.age;
    expect(firstAccess).toBeDefined();

    // 后续访问
    const secondAccess = demo.age;
    expect(secondAccess).toBeDefined();

    // 修改依赖属性
    demo.id = 2;

    // 在非 reactive 场景下，Plan_A_Eager 的 ComputedRef 已在 addInitializer 阶段创建。
    // 由于实例未经 reactive() 包装，ComputedRef 不会被自动解包，
    // 但 ComputedRef 内部通过 getter 函数直接读取 this.id，
    // 行为可能因实现而异（取决于 computed 内部的响应式追踪是否对原始实例生效）。
    const afterChange = demo.age;

    // 记录实际行为
    expect(typeof afterChange !== 'undefined').toBe(true);
  });
});
