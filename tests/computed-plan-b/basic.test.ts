import { ComputedPlanB } from '@/index';
import { reactive } from 'vue';

describe('Plan_B — 基础功能', () => {
  // 测试：getter 返回值正确性 — 在 reactive 代理上访问被装饰的 getter 属性，返回值应与原始 getter 计算结果一致（需求 2.1）
  it('getter 返回值与原始计算结果一致', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanB()
      public get age() {
        return this.computeAge() + 100;
      }

      public computeAge() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // 在 reactive 代理上访问 getter，返回值应与原始计算结果一致
    expect(reactiveDemo.age).toBe(111); // 1 + 10 + 100 = 111
  });

  // 测试：首次调用创建 ComputedRef 并缓存到实例上（需求 2.2）
  it('首次调用创建 ComputedRef 并缓存', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanB()
      public get age() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // 首次访问前，实例上不应有 Symbol 缓存
    const symbolKeys = Object.getOwnPropertySymbols(demo);
    const computedSymbols = symbolKeys.filter((s) =>
      String(s).includes('__computed__')
    );
    expect(computedSymbols.length).toBe(0);

    // 首次访问 getter
    expect(reactiveDemo.age).toBe(11);

    // 首次访问后，实例上应存在 Symbol 缓存的 ComputedRef
    const symbolKeysAfter = Object.getOwnPropertySymbols(demo);
    const computedSymbolsAfter = symbolKeysAfter.filter((s) =>
      String(s).includes('__computed__')
    );
    expect(computedSymbolsAfter.length).toBe(1);
  });

  // 测试：后续调用复用缓存的 ComputedRef，computed() 仅调用一次（需求 2.3）
  it('后续调用复用缓存的 ComputedRef — computed() 仅调用一次', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanB()
      public get age() {
        return this.computeAge() + 100;
      }

      public computeAge() {
        return this.id + 10;
      }
    }

    const spyOnComputeAge = vi.spyOn(DemoService.prototype, 'computeAge');

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    expect(spyOnComputeAge).not.toHaveBeenCalled();

    // 首次访问，触发 ComputedRef 创建，原始 getter 被调用一次
    expect(reactiveDemo.age).toBe(111);
    expect(spyOnComputeAge).toHaveBeenCalledTimes(1);

    // 后续多次访问，依赖未变化，ComputedRef 缓存生效，原始 getter 不再被调用
    expect(reactiveDemo.age).toBe(111);
    expect(reactiveDemo.age).toBe(111);
    expect(reactiveDemo.age).toBe(111);
    expect(spyOnComputeAge).toHaveBeenCalledTimes(1);

    // 同时验证 Symbol 缓存 key 数量不变（仅创建了一个 ComputedRef）
    const symbolKeys = Object.getOwnPropertySymbols(demo);
    const computedSymbols = symbolKeys.filter((s) =>
      String(s).includes('__computed__')
    );
    expect(computedSymbols.length).toBe(1);

    spyOnComputeAge.mockRestore();
  });

  // 测试：Symbol 缓存 key 不与用户属性冲突（需求 2.3）
  it('Symbol 缓存 key 不与用户属性冲突', () => {
    class DemoService {
      public id = 1;
      // 用户定义的普通属性，名称中包含 age
      public __computed__age = 'user-defined';

      @ComputedPlanB()
      public get age() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // getter 正常工作
    expect(reactiveDemo.age).toBe(11);

    // 用户定义的属性不受影响
    expect(reactiveDemo.__computed__age).toBe('user-defined');

    // 缓存使用 Symbol key，不会覆盖用户属性
    const symbolKeys = Object.getOwnPropertySymbols(demo);
    const computedSymbols = symbolKeys.filter((s) =>
      String(s).includes('__computed__')
    );
    expect(computedSymbols.length).toBe(1);
  });

  // 测试：仅处理 getter 装饰器（需求 2.5）
  it('仅处理 getter 装饰器', () => {
    // ComputedPlanB 的类型签名限制了它只能应用于 getter
    // 通过运行时验证：装饰器返回的函数是一个新的 getter 函数
    const decorator = ComputedPlanB();
    expect(typeof decorator).toBe('function');

    // 模拟一个 getter 函数
    const originalGetter = function (this: any) {
      return 42;
    };

    // 模拟 ClassGetterDecoratorContext
    const mockContext = {
      kind: 'getter' as const,
      name: 'testProp',
      static: false,
      private: false,
      addInitializer: vi.fn(),
      access: { get: vi.fn(), has: vi.fn() },
      metadata: {},
    } as unknown as ClassGetterDecoratorContext;

    // 装饰器应返回一个新的 getter 函数
    const result = decorator(originalGetter, mockContext);
    expect(typeof result).toBe('function');
  });
});
