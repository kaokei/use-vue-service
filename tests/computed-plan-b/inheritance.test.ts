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
