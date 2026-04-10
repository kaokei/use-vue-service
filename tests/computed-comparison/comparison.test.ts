/**
 * 三种方案行为对比测试
 *
 * 对比 Plan_A_Lazy、Plan_A_Eager、Plan_B 在相同场景下的行为差异。
 * 由于三种装饰器不能在同一个类上混用，每个测试用例为每种方案定义独立的类。
 *
 * 验证：需求 8.2, 8.3
 */

import { ComputedPlanALazy, ComputedPlanAEager, ComputedPlanB } from '@/index';
import { reactive, isRef } from 'vue';

describe('三种方案行为对比', () => {
  // 测试 1：三种方案在相同输入下返回相同的计算结果（需求 8.2）
  it('相同输入下返回相同的计算结果', () => {
    class ServiceALazy {
      public id = 1;
      @ComputedPlanALazy()
      public get age() {
        return this.id + 10;
      }
    }
    class ServiceAEager {
      public id = 1;
      @ComputedPlanAEager()
      public get age() {
        return this.id + 10;
      }
    }
    class ServiceB {
      public id = 1;
      @ComputedPlanB()
      public get age() {
        return this.id + 10;
      }
    }

    const rALazy = reactive(new ServiceALazy());
    const rAEager = reactive(new ServiceAEager());
    const rB = reactive(new ServiceB());

    // 三种方案在相同输入下应返回相同的计算结果
    expect(rALazy.age).toBe(11);
    expect(rAEager.age).toBe(11);
    expect(rB.age).toBe(11);

    expect(rALazy.age).toBe(rAEager.age);
    expect(rAEager.age).toBe(rB.age);
  });

  // 测试 2：三种方案在依赖变化后都能正确重新计算（需求 8.2）
  it('依赖变化后都能正确重新计算', () => {
    class ServiceALazy {
      public id = 1;
      @ComputedPlanALazy()
      public get age() {
        return this.id + 10;
      }
    }
    class ServiceAEager {
      public id = 1;
      @ComputedPlanAEager()
      public get age() {
        return this.id + 10;
      }
    }
    class ServiceB {
      public id = 1;
      @ComputedPlanB()
      public get age() {
        return this.id + 10;
      }
    }

    const rALazy = reactive(new ServiceALazy());
    const rAEager = reactive(new ServiceAEager());
    const rB = reactive(new ServiceB());

    // 初始值一致
    expect(rALazy.age).toBe(11);
    expect(rAEager.age).toBe(11);
    expect(rB.age).toBe(11);

    // 修改依赖
    rALazy.id = 100;
    rAEager.id = 100;
    rB.id = 100;

    // 三种方案都应返回正确的新值
    expect(rALazy.age).toBe(110);
    expect(rAEager.age).toBe(110);
    expect(rB.age).toBe(110);

    // 再次修改依赖
    rALazy.id = -5;
    rAEager.id = -5;
    rB.id = -5;

    expect(rALazy.age).toBe(5);
    expect(rAEager.age).toBe(5);
    expect(rB.age).toBe(5);
  });

  // 测试 3：三种方案在多实例场景下都能正确隔离（需求 8.2）
  it('多实例场景下都能正确隔离', () => {
    class ServiceALazy {
      public id: number;
      constructor(id = 1) {
        this.id = id;
      }
      @ComputedPlanALazy()
      public get age() {
        return this.id + 10;
      }
    }
    class ServiceAEager {
      public id: number;
      constructor(id = 1) {
        this.id = id;
      }
      @ComputedPlanAEager()
      public get age() {
        return this.id + 10;
      }
    }
    class ServiceB {
      public id: number;
      constructor(id = 1) {
        this.id = id;
      }
      @ComputedPlanB()
      public get age() {
        return this.id + 10;
      }
    }

    // 为每种方案创建两个实例
    const aLazy1 = reactive(new ServiceALazy(1));
    const aLazy2 = reactive(new ServiceALazy(2));
    const aEager1 = reactive(new ServiceAEager(1));
    const aEager2 = reactive(new ServiceAEager(2));
    const b1 = reactive(new ServiceB(1));
    const b2 = reactive(new ServiceB(2));

    // 初始值正确
    expect(aLazy1.age).toBe(11);
    expect(aLazy2.age).toBe(12);
    expect(aEager1.age).toBe(11);
    expect(aEager2.age).toBe(12);
    expect(b1.age).toBe(11);
    expect(b2.age).toBe(12);

    // 修改实例 1 的依赖，实例 2 不受影响
    aLazy1.id = 100;
    aEager1.id = 100;
    b1.id = 100;

    expect(aLazy1.age).toBe(110);
    expect(aLazy2.age).toBe(12);
    expect(aEager1.age).toBe(110);
    expect(aEager2.age).toBe(12);
    expect(b1.age).toBe(110);
    expect(b2.age).toBe(12);
  });

  // 测试 4：三种方案在继承场景下的行为对比（需求 8.2）
  it('继承场景下的行为对比 — 子类继承未覆盖 getter', () => {
    class ParentALazy {
      public id = 1;
      @ComputedPlanALazy()
      public get age() {
        return this.id + 10;
      }
    }
    class ChildALazy extends ParentALazy {}

    class ParentAEager {
      public id = 1;
      @ComputedPlanAEager()
      public get age() {
        return this.id + 10;
      }
    }
    class ChildAEager extends ParentAEager {}

    class ParentB {
      public id = 1;
      @ComputedPlanB()
      public get age() {
        return this.id + 10;
      }
    }
    class ChildB extends ParentB {}

    const rChildALazy = reactive(new ChildALazy());
    const rChildAEager = reactive(new ChildAEager());
    const rChildB = reactive(new ChildB());

    // 三种方案的子类实例都应正确继承父类 getter 逻辑
    expect(rChildALazy.age).toBe(11);
    expect(rChildAEager.age).toBe(11);
    expect(rChildB.age).toBe(11);

    // 修改依赖后，三种方案都应正确重新计算
    rChildALazy.id = 50;
    rChildAEager.id = 50;
    rChildB.id = 50;

    expect(rChildALazy.age).toBe(60);
    expect(rChildAEager.age).toBe(60);
    expect(rChildB.age).toBe(60);
  });

  // 测试 4b：继承场景 — 子类覆盖 getter（需求 8.2）
  it('继承场景下的行为对比 — 子类覆盖 getter', () => {
    class ParentALazy {
      public id = 1;
      @ComputedPlanALazy()
      public get age() {
        return this.id + 10;
      }
    }
    class ChildALazy extends ParentALazy {
      @ComputedPlanALazy()
      public get age() {
        return this.id * 2;
      }
    }

    class ParentAEager {
      public id = 1;
      @ComputedPlanAEager()
      public get age() {
        return this.id + 10;
      }
    }
    class ChildAEager extends ParentAEager {
      @ComputedPlanAEager()
      public get age() {
        return this.id * 2;
      }
    }

    class ParentB {
      public id = 1;
      @ComputedPlanB()
      public get age() {
        return this.id + 10;
      }
    }
    class ChildB extends ParentB {
      @ComputedPlanB()
      public get age() {
        return this.id * 2;
      }
    }

    const rChildALazy = reactive(new ChildALazy());
    const rChildAEager = reactive(new ChildAEager());
    const rChildB = reactive(new ChildB());

    // 三种方案的子类实例都应使用子类的 getter 逻辑（乘以 2）
    expect(rChildALazy.age).toBe(2);
    expect(rChildAEager.age).toBe(2);
    expect(rChildB.age).toBe(2);

    // 父类实例应使用父类的 getter 逻辑（加 10）
    const rParentALazy = reactive(new ParentALazy());
    const rParentAEager = reactive(new ParentAEager());
    const rParentB = reactive(new ParentB());

    expect(rParentALazy.age).toBe(11);
    expect(rParentAEager.age).toBe(11);
    expect(rParentB.age).toBe(11);
  });

  // 测试 5：三种方案在 Auto_Unwrap 行为上的差异（需求 8.3）
  // Plan_A（Lazy 和 Eager）依赖 reactive 的 Auto_Unwrap 机制
  // Plan_B 手动返回 .value
  // 在 reactive 代理上访问时，三种方案都应返回原始值（非 ComputedRef 对象）
  it('Auto_Unwrap 行为 — 三种方案在 reactive 代理上都返回原始值', () => {
    class ServiceALazy {
      public id = 1;
      @ComputedPlanALazy()
      public get age() {
        return this.id + 10;
      }
    }
    class ServiceAEager {
      public id = 1;
      @ComputedPlanAEager()
      public get age() {
        return this.id + 10;
      }
    }
    class ServiceB {
      public id = 1;
      @ComputedPlanB()
      public get age() {
        return this.id + 10;
      }
    }

    const instALazy = new ServiceALazy();
    const instAEager = new ServiceAEager();
    const instB = new ServiceB();

    const rALazy = reactive(instALazy);
    const rAEager = reactive(instAEager);
    const rB = reactive(instB);

    // 三种方案在 reactive 代理上访问时，都应返回原始值（number 类型），非 ComputedRef 对象
    const valALazy = rALazy.age;
    const valAEager = rAEager.age;
    const valB = rB.age;

    expect(typeof valALazy).toBe('number');
    expect(typeof valAEager).toBe('number');
    expect(typeof valB).toBe('number');

    expect(isRef(valALazy)).toBe(false);
    expect(isRef(valAEager)).toBe(false);
    expect(isRef(valB)).toBe(false);

    // 值应一致
    expect(valALazy).toBe(11);
    expect(valAEager).toBe(11);
    expect(valB).toBe(11);

    // Plan_A（Lazy 和 Eager）的底层机制：在原始实例上创建了 ComputedRef 数据属性
    // 访问 reactive 代理时通过 Auto_Unwrap 自动解包
    // Plan_A_Lazy：首次访问后才创建
    const descALazy = Object.getOwnPropertyDescriptor(instALazy, 'age');
    expect(descALazy).toBeDefined();
    expect(isRef(descALazy!.value)).toBe(true);

    // Plan_A_Eager：new 阶段就已创建
    const descAEager = Object.getOwnPropertyDescriptor(instAEager, 'age');
    expect(descAEager).toBeDefined();
    expect(isRef(descAEager!.value)).toBe(true);

    // Plan_B：使用 Symbol 缓存，getter 保持不变，手动返回 .value
    // 原始实例上不存在同名的数据属性（age 仍然是原型链上的 getter）
    const descB = Object.getOwnPropertyDescriptor(instB, 'age');
    // Plan_B 不在实例上创建同名数据属性
    expect(descB).toBeUndefined();
    // 但存在 Symbol 缓存
    const symbolKeys = Object.getOwnPropertySymbols(instB);
    const computedSymbols = symbolKeys.filter((s) =>
      String(s).includes('__computed__')
    );
    expect(computedSymbols.length).toBe(1);
  });

  // 测试 6：三种方案的 getter 调用次数对比（需求 8.3）
  // Plan_A_Lazy：首次访问调用一次，后续不调用（getter 被数据属性覆盖）
  // Plan_A_Eager：new 阶段调用一次（computed 创建时求值），后续不调用
  // Plan_B：首次访问调用一次，后续每次访问都调用 getter 函数（但内部 computed 缓存，原始 getter 不重新计算）
  it('getter 调用次数对比 — 性能特征差异', () => {
    // --- Plan_A_Lazy ---
    class ServiceALazy {
      public id = 1;
      @ComputedPlanALazy()
      public get age() {
        return this.computeAge();
      }
      public computeAge() {
        return this.id + 10;
      }
    }

    const spyALazy = vi.spyOn(ServiceALazy.prototype, 'computeAge');
    const instALazy = new ServiceALazy();
    const rALazy = reactive(instALazy);

    // new 之后，computeAge 未被调用
    expect(spyALazy).toHaveBeenCalledTimes(0);

    // 首次访问：触发 getter，创建 ComputedRef，computeAge 被调用一次
    rALazy.age;
    expect(spyALazy).toHaveBeenCalledTimes(1);

    // 后续访问：getter 已被数据属性覆盖，不再调用 computeAge
    rALazy.age;
    rALazy.age;
    rALazy.age;
    expect(spyALazy).toHaveBeenCalledTimes(1);

    spyALazy.mockRestore();

    // --- Plan_A_Eager ---
    class ServiceAEager {
      public id = 1;
      @ComputedPlanAEager()
      public get age() {
        return this.computeAge();
      }
      public computeAge() {
        return this.id + 10;
      }
    }

    const spyAEager = vi.spyOn(ServiceAEager.prototype, 'computeAge');
    const instAEager = new ServiceAEager();

    // new 阶段：addInitializer 中创建 ComputedRef，但 Vue 的 computed() 是惰性的，
    // 创建时不会立即求值，因此 computeAge 此时未被调用。
    // 这也是 Plan_A_Eager 实现中的设计决策：不在 addInitializer 中强制求值，
    // 因为此时字段初始化器尚未执行（this.id 等字段为 undefined）。
    const callsAfterNew = spyAEager.mock.calls.length;
    expect(callsAfterNew).toBe(0);

    const rAEager = reactive(instAEager);

    // 首次访问：通过 Auto_Unwrap 读取 ComputedRef.value，触发惰性求值，computeAge 被调用一次
    rAEager.age;
    expect(spyAEager).toHaveBeenCalledTimes(1);

    // 后续访问：computed 缓存生效，依赖未变化，computeAge 不再被调用
    rAEager.age;
    rAEager.age;
    rAEager.age;
    expect(spyAEager).toHaveBeenCalledTimes(1);

    spyAEager.mockRestore();

    // --- Plan_B ---
    class ServiceB {
      public id = 1;
      @ComputedPlanB()
      public get age() {
        return this.computeAge();
      }
      public computeAge() {
        return this.id + 10;
      }
    }

    const spyB = vi.spyOn(ServiceB.prototype, 'computeAge');
    const instB = new ServiceB();
    const rB = reactive(instB);

    // new 之后，computeAge 未被调用
    expect(spyB).toHaveBeenCalledTimes(0);

    // 首次访问：触发 getter，创建 ComputedRef，computeAge 被调用一次
    rB.age;
    expect(spyB).toHaveBeenCalledTimes(1);

    // 后续访问：每次都调用 getter 函数（因为 getter 未被替换），
    // 但内部 computed 缓存生效，原始 computeAge 不重新计算（依赖未变化）
    rB.age;
    rB.age;
    rB.age;
    // computeAge 仍然只被调用了 1 次（computed 缓存生效）
    expect(spyB).toHaveBeenCalledTimes(1);

    spyB.mockRestore();
  });
});
