import { ComputedPlanALazy } from '@/index';
import { reactive, ComputedRef, isRef } from 'vue';

describe('Plan_A_Lazy — 基础功能', () => {
  // 测试：getter 返回值与原始 getter 计算结果一致（需求 1.1, 1.4）
  it('getter 返回值与原始计算结果一致', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanALazy()
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

  // 测试：首次访问后，后续访问不再调用原始 getter（需求 1.2）
  it('缓存行为 — 后续访问不调用原始 getter', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanALazy()
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

    // 首次访问，触发 getter 计算
    expect(reactiveDemo.age).toBe(111);
    expect(spyOnComputeAge).toHaveBeenCalledOnce();

    // 后续多次访问，依赖未变化，不应再调用原始 getter
    expect(reactiveDemo.age).toBe(111);
    expect(reactiveDemo.age).toBe(111);
    expect(spyOnComputeAge).toHaveBeenCalledOnce();
  });

  // 测试：首次访问前实例上不存在同名 ComputedRef 数据属性（需求 1.6, 1.7）
  it('懒创建验证 — 首次访问前无 ComputedRef', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanALazy()
      public get age() {
        return this.computeAge() + 100;
      }

      public computeAge() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // 实例创建后、首次访问前，原始实例上不应存在同名的数据属性
    // 此时 age 应该仍然是原型链上的 getter，而非实例自身的数据属性
    const descriptor = Object.getOwnPropertyDescriptor(demo, 'age');
    expect(descriptor).toBeUndefined();
  });

  // 测试：首次访问后实例上存在同名 ComputedRef 数据属性（需求 1.6）
  it('懒创建验证 — 首次访问后有 ComputedRef', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanALazy()
      public get age() {
        return this.computeAge() + 100;
      }

      public computeAge() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // 首次访问前，实例上不存在同名数据属性
    expect(Object.getOwnPropertyDescriptor(demo, 'age')).toBeUndefined();

    // 在 reactive 代理上首次访问
    reactiveDemo.age;

    // 首次访问后，原始实例上应存在同名的数据属性（ComputedRef）
    const descriptor = Object.getOwnPropertyDescriptor(demo, 'age');
    expect(descriptor).toBeDefined();
    expect(descriptor!.value).toBeDefined();
    expect(isRef(descriptor!.value)).toBe(true);
  });

  // 测试：仅处理 getter 装饰器（需求 1.5）
  it('仅处理 getter 装饰器', () => {
    // ComputedPlanALazy 的类型签名限制了它只能应用于 getter
    // 通过运行时验证：装饰器返回的函数是一个新的 getter 函数
    const decorator = ComputedPlanALazy();
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

  // 测试：Auto_Unwrap 验证（需求 1.4）
  it('Auto_Unwrap — 返回自动解包后的值', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanALazy()
      public get age() {
        return this.computeAge() + 100;
      }

      public computeAge() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // 在 reactive 代理上访问属性时，返回的应该是自动解包后的值（number 类型）
    const value = reactiveDemo.age;
    expect(typeof value).toBe('number');
    expect(value).toBe(111);

    // 确认不是 ComputedRef 对象
    expect(isRef(value)).toBe(false);
  });
});
