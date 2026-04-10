import { ComputedPlanB } from './computed-plan-b';
import { reactive } from 'vue';

describe('Plan_B — 继承场景', () => {
  // 测试：子类继承未覆盖 getter — 子类实例正确创建独立 ComputedRef（需求 10.1）
  it('子类继承未覆盖 getter — 子类实例正确创建独立 ComputedRef', () => {
    class ParentService {
      public id = 1;

      @ComputedPlanB()
      public get age() {
        return this.id + 10;
      }
    }

    class ChildService extends ParentService {
      // 未覆盖 age getter
    }

    const child = new ChildService();
    const reactiveChild = reactive(child);

    // 子类实例应正确使用父类的 getter 逻辑
    expect(reactiveChild.age).toBe(11);

    // 修改依赖后应正确重新计算
    reactiveChild.id = 5;
    expect(reactiveChild.age).toBe(15);

    // 父类实例和子类实例应独立
    const parent = new ParentService();
    const reactiveParent = reactive(parent);

    expect(reactiveParent.age).toBe(11);

    // 修改子类实例不影响父类实例
    reactiveChild.id = 100;
    expect(reactiveChild.age).toBe(110);
    expect(reactiveParent.age).toBe(11);
  });

  // 测试：子类覆盖 getter — 使用子类的 getter 实现计算（需求 10.2）
  it('子类覆盖 getter — 使用子类的 getter 实现计算', () => {
    class ParentService {
      public id = 1;

      @ComputedPlanB()
      public get age() {
        return this.id + 10;
      }
    }

    class ChildService extends ParentService {
      @ComputedPlanB()
      public get age() {
        // 子类使用不同的计算逻辑：乘以 2 而非加 10
        return this.id * 2;
      }
    }

    const child = new ChildService();
    const reactiveChild = reactive(child);

    // 子类实例应使用子类的 getter 逻辑
    expect(reactiveChild.age).toBe(2); // 1 * 2 = 2

    reactiveChild.id = 5;
    expect(reactiveChild.age).toBe(10); // 5 * 2 = 10

    // 父类实例应使用父类的 getter 逻辑
    const parent = new ParentService();
    const reactiveParent = reactive(parent);

    expect(reactiveParent.age).toBe(11); // 1 + 10 = 11

    reactiveParent.id = 5;
    expect(reactiveParent.age).toBe(15); // 5 + 10 = 15
  });

  // 测试：多层继承 — 祖父类 → 父类 → 子类（需求 10.1, 10.2）
  it('多层继承 — 祖父类 → 父类 → 子类', () => {
    class GrandParentService {
      public id = 1;

      @ComputedPlanB()
      public get age() {
        return this.id + 10;
      }
    }

    class ParentService extends GrandParentService {
      // 未覆盖 age getter，继承祖父类的逻辑
    }

    class ChildService extends ParentService {
      @ComputedPlanB()
      public get age() {
        // 子类覆盖 getter，使用不同的计算逻辑
        return this.id * 3;
      }
    }

    const grandParent = new GrandParentService();
    const reactiveGrandParent = reactive(grandParent);

    const parent = new ParentService();
    const reactiveParent = reactive(parent);

    const child = new ChildService();
    const reactiveChild = reactive(child);

    // 祖父类实例使用祖父类的逻辑
    expect(reactiveGrandParent.age).toBe(11); // 1 + 10

    // 父类实例继承祖父类的逻辑（未覆盖）
    expect(reactiveParent.age).toBe(11); // 1 + 10

    // 子类实例使用子类覆盖后的逻辑
    expect(reactiveChild.age).toBe(3); // 1 * 3

    // 修改各实例的依赖，验证互不干扰
    reactiveGrandParent.id = 5;
    reactiveParent.id = 10;
    reactiveChild.id = 20;

    expect(reactiveGrandParent.age).toBe(15); // 5 + 10
    expect(reactiveParent.age).toBe(20); // 10 + 10
    expect(reactiveChild.age).toBe(60); // 20 * 3
  });
});


// ============================================================================
// 属性测试（Property-Based Tests）
// ============================================================================

import fc from 'fast-check';
import {
  PBT_NUM_RUNS,
  arbInitialValue,
} from '../computed-helpers';

describe('Plan_B — 属性测试（继承场景）', () => {
  /**
   * Feature: computed-decorator-redesign, Property 9
   * 继承场景 — 未覆盖 getter
   *
   * 对于任意子类继承父类中被 Computed_Decorator 装饰的 getter 属性且未覆盖该 getter 时，
   * 子类实例上应正确创建独立的 ComputedRef 缓存，且 getter 的计算逻辑与父类一致。
   *
   * **Validates: Requirements 10.1**
   */
  it('Feature: computed-decorator-redesign, Property 9 — 继承场景 — 未覆盖 getter', () => {
    fc.assert(
      fc.property(
        arbInitialValue,
        arbInitialValue,
        // 生成 1~5 次变更值序列
        fc.array(fc.integer({ min: -1000, max: 1000 }), { minLength: 1, maxLength: 5 }),
        (parentInitialId, childInitialId, changeValues) => {
          // 父类：使用 @ComputedPlanB() 装饰 getter
          class ParentService {
            public id: number;

            constructor(id: number) {
              this.id = id;
            }

            @ComputedPlanB()
            public get age() {
              return this.id + 10;
            }
          }

          // 子类：继承父类，未覆盖 age getter
          class ChildService extends ParentService {}

          const parent = new ParentService(parentInitialId);
          const reactiveParent = reactive(parent);

          const child = new ChildService(childInitialId);
          const reactiveChild = reactive(child);

          // 验证初始计算结果：子类使用与父类一致的计算逻辑
          expect(reactiveParent.age).toBe(parentInitialId + 10);
          expect(reactiveChild.age).toBe(childInitialId + 10);

          // 修改子类实例的依赖，不影响父类实例
          for (const newId of changeValues) {
            reactiveChild.id = newId;
            expect(reactiveChild.age).toBe(newId + 10);
            // 父类实例的 getter 返回值应保持不变
            expect(reactiveParent.age).toBe(parentInitialId + 10);
          }

          // 修改父类实例的依赖，不影响子类实例
          const lastChildId = changeValues[changeValues.length - 1];
          for (const newId of changeValues) {
            reactiveParent.id = newId;
            expect(reactiveParent.age).toBe(newId + 10);
            // 子类实例的 getter 返回值应保持为最后一次修改的值
            expect(reactiveChild.age).toBe(lastChildId + 10);
          }
        }
      ),
      { numRuns: PBT_NUM_RUNS }
    );
  });

  /**
   * Feature: computed-decorator-redesign, Property 10
   * 继承场景 — 覆盖 getter
   *
   * 对于任意子类覆盖父类中被 Computed_Decorator 装饰的 getter 属性时，
   * 子类实例的 ComputedRef 应使用子类的 getter 实现进行计算，不受父类实现的影响。
   *
   * **Validates: Requirements 10.2**
   */
  it('Feature: computed-decorator-redesign, Property 10 — 继承场景 — 覆盖 getter', () => {
    fc.assert(
      fc.property(
        arbInitialValue,
        arbInitialValue,
        // 生成 1~5 次变更值序列
        fc.array(fc.integer({ min: -1000, max: 1000 }), { minLength: 1, maxLength: 5 }),
        (parentInitialId, childInitialId, changeValues) => {
          // 父类：getter 使用 id + 10 的计算逻辑
          class ParentService {
            public id: number;

            constructor(id: number) {
              this.id = id;
            }

            @ComputedPlanB()
            public get age() {
              return this.id + 10;
            }
          }

          // 子类：覆盖 getter，使用 id * 2 的计算逻辑（不同于父类）
          class ChildService extends ParentService {
            @ComputedPlanB()
            public get age() {
              return this.id * 2;
            }
          }

          const parent = new ParentService(parentInitialId);
          const reactiveParent = reactive(parent);

          const child = new ChildService(childInitialId);
          const reactiveChild = reactive(child);

          // 验证初始计算结果：父类使用 id + 10，子类使用 id * 2
          expect(reactiveParent.age).toBe(parentInitialId + 10);
          expect(reactiveChild.age).toBe(childInitialId * 2);

          // 依次修改依赖属性，验证子类始终使用子类的 getter 实现
          for (const newId of changeValues) {
            reactiveChild.id = newId;
            // 子类应使用子类的计算逻辑（id * 2），不受父类实现影响
            expect(reactiveChild.age).toBe(newId * 2);

            reactiveParent.id = newId;
            // 父类应使用父类的计算逻辑（id + 10）
            expect(reactiveParent.age).toBe(newId + 10);
          }
        }
      ),
      { numRuns: PBT_NUM_RUNS }
    );
  });
});
