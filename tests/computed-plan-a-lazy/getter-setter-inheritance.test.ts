import { Computed as ComputedPlanALazy } from '@/index';
import { reactive } from 'vue';

/**
 * getter/setter + 继承的组合场景测试
 *
 * 覆盖以下场景：
 * 1. 同一类中 getter + setter 的基本交互
 * 2. 父类有 @Computed getter + setter，子类继承不覆盖
 * 3. 父类有 @Computed getter，子类添加同名 setter
 * 4. 父类有 @Computed getter + setter，子类覆盖 getter（保留父类 setter）
 * 5. 父类有 @Computed getter + setter，子类覆盖 setter（保留父类 getter）
 * 6. 父类有 @Computed getter，子类有不同名的 @Computed getter
 * 7. 三层继承中 setter 的传递
 * 8. 三层继承中 setter 在中间层添加
 */

describe('getter/setter + 继承组合场景', () => {
  // 场景 1：同一类中 getter + setter 的基本交互
  it('同一类中 getter + setter — 赋值触发 setter 并更新 getter', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanALazy()
      public get age() {
        return this.id + 10;
      }
      public set age(val: number) {
        this.id = val - 10;
      }
    }

    const demo = new DemoService();
    const r = reactive(demo);

    expect(r.age).toBe(11); // 1 + 10

    // 赋值触发 setter：id = 20 - 10 = 10
    r.age = 20;
    expect(r.id).toBe(10);
    expect(r.age).toBe(20); // 10 + 10

    // 直接修改依赖也能触发 getter 更新
    r.id = 5;
    expect(r.age).toBe(15); // 5 + 10
  });

  // 场景 2：父类有 @Computed getter + setter，子类继承不覆盖
  it('父类有 getter + setter，子类继承不覆盖', () => {
    class ParentService {
      public id = 1;

      @ComputedPlanALazy()
      public get age() {
        return this.id + 10;
      }
      public set age(val: number) {
        this.id = val - 10;
      }
    }

    class ChildService extends ParentService {}

    const child = new ChildService();
    const r = reactive(child);

    expect(r.age).toBe(11);

    // 子类实例上赋值应触发父类的 setter
    r.age = 30;
    expect(r.id).toBe(20); // 30 - 10
    expect(r.age).toBe(30); // 20 + 10

    // 父类实例独立
    const parent = new ParentService();
    const rp = reactive(parent);
    expect(rp.age).toBe(11);
    rp.age = 50;
    expect(rp.id).toBe(40);
    expect(rp.age).toBe(50);

    // 互不干扰
    expect(r.age).toBe(30);
  });

  // 场景 3：父类有 @Computed getter，子类添加同名 setter
  // 注意：JavaScript 语言限制 — 子类只定义 setter 时，会在子类原型上创建一个
  // 只有 setter 的属性描述符，遮蔽父类原型上的 getter。
  // 因此子类实例访问该属性时 getter 为 undefined，返回 undefined。
  // 这不是装饰器的问题，而是 JavaScript 原型链的固有行为。
  // 正确做法是子类同时重新定义 getter 和 setter。
  it('父类有 getter，子类只添加同名 setter — JavaScript 语言限制', () => {
    class ParentService {
      public id = 1;

      @ComputedPlanALazy()
      public get age() {
        return this.id + 10;
      }
    }

    class ChildService extends ParentService {
      public set age(val: number) {
        this.id = val - 10;
      }
    }

    const child = new ChildService();
    const r = reactive(child);

    // JavaScript 语言限制：子类只定义 setter 会遮蔽父类的 getter
    // 访问 getter 返回 undefined
    expect(r.age).toBeUndefined();
  });

  // 场景 4：父类有 @Computed getter + setter，子类覆盖 getter（保留父类 setter）
  it('父类有 getter + setter，子类覆盖 getter', () => {
    class ParentService {
      public id = 1;

      @ComputedPlanALazy()
      public get age() {
        return this.id + 10;
      }
      public set age(val: number) {
        this.id = val - 10;
      }
    }

    class ChildService extends ParentService {
      @ComputedPlanALazy()
      public get age() {
        // 子类使用不同的计算逻辑
        return this.id * 2;
      }
      // 不覆盖 setter，继承父类的 setter
    }

    const child = new ChildService();
    const r = reactive(child);

    expect(r.age).toBe(2); // 1 * 2

    // 赋值应触发父类的 setter：id = 20 - 10 = 10
    r.age = 20;
    expect(r.id).toBe(10);
    // getter 使用子类的逻辑：10 * 2 = 20
    expect(r.age).toBe(20);

    // 父类实例使用父类的逻辑
    const parent = new ParentService();
    const rp = reactive(parent);
    expect(rp.age).toBe(11); // 1 + 10
  });

  // 场景 5：父类有 @Computed getter + setter，子类覆盖 setter（保留父类 getter）
  // 注意：JavaScript 语言限制 — 子类只定义 setter 时，会遮蔽父类的 getter/setter 对。
  // 正确做法是子类同时重新定义 getter 和 setter。
  it('父类有 getter + setter，子类只覆盖 setter — JavaScript 语言限制', () => {
    class ParentService {
      public id = 1;

      @ComputedPlanALazy()
      public get age() {
        return this.id + 10;
      }
      public set age(val: number) {
        this.id = val - 10;
      }
    }

    class ChildService extends ParentService {
      // 子类只覆盖 setter，会遮蔽父类的 getter
      public set age(val: number) {
        this.id = val; // 直接赋值
      }
    }

    const child = new ChildService();
    const r = reactive(child);

    // JavaScript 语言限制：子类只定义 setter 会遮蔽父类的 getter
    expect(r.age).toBeUndefined();
  });

  // 场景 5b：正确做法 — 子类同时重新定义 getter 和 setter
  it('父类有 getter + setter，子类同时覆盖 getter 和 setter', () => {
    class ParentService {
      public id = 1;

      @ComputedPlanALazy()
      public get age() {
        return this.id + 10;
      }
      public set age(val: number) {
        this.id = val - 10;
      }
    }

    class ChildService extends ParentService {
      @ComputedPlanALazy()
      public get age() {
        return this.id + 10; // 保持与父类相同的逻辑
      }
      public set age(val: number) {
        this.id = val; // 子类使用不同的赋值逻辑
      }
    }

    const child = new ChildService();
    const r = reactive(child);

    expect(r.age).toBe(11); // 1 + 10

    // 赋值触发子类的 setter：id = 20（直接赋值）
    r.age = 20;
    expect(r.id).toBe(20);
    // getter：20 + 10 = 30
    expect(r.age).toBe(30);

    // 父类实例使用父类的 setter
    const parent = new ParentService();
    const rp = reactive(parent);
    // 注意：需要先访问 getter 触发 ComputedRef 创建，然后赋值才能正确触发 writable computed 的 setter
    expect(rp.age).toBe(11);
    rp.age = 20;
    expect(rp.id).toBe(10); // 20 - 10（父类 setter）
  });

  // 场景 6：父类有 @Computed getter，子类有不同名的 @Computed getter
  it('父类和子类有不同名的 @Computed getter', () => {
    class ParentService {
      public id = 1;

      @ComputedPlanALazy()
      public get age() {
        return this.id + 10;
      }
    }

    class ChildService extends ParentService {
      @ComputedPlanALazy()
      public get score() {
        return this.id * 3;
      }
    }

    const child = new ChildService();
    const r = reactive(child);

    // 父类的 getter 正常工作
    expect(r.age).toBe(11); // 1 + 10
    // 子类的 getter 正常工作
    expect(r.score).toBe(3); // 1 * 3

    // 修改依赖后两个 getter 都更新
    r.id = 5;
    expect(r.age).toBe(15); // 5 + 10
    expect(r.score).toBe(15); // 5 * 3
  });

  // 场景 7：三层继承中 setter 的传递
  // C 有 getter + setter，B 不覆盖，A 覆盖 getter
  it('三层继承 — C 有 getter+setter，B 不覆盖，A 覆盖 getter', () => {
    class GrandParent {
      public id = 1;

      @ComputedPlanALazy()
      public get age() {
        return this.id + 10;
      }
      public set age(val: number) {
        this.id = val - 10;
      }
    }

    class Parent extends GrandParent {
      // 不覆盖 getter 和 setter
    }

    class Child extends Parent {
      @ComputedPlanALazy()
      public get age() {
        return this.id * 5;
      }
      // 不覆盖 setter，继承祖父类的 setter
    }

    const child = new Child();
    const r = reactive(child);

    expect(r.age).toBe(5); // 1 * 5

    // 赋值触发祖父类的 setter：id = 50 - 10 = 40
    r.age = 50;
    expect(r.id).toBe(40);
    // getter 使用子类的逻辑：40 * 5 = 200
    expect(r.age).toBe(200);

    // 中间层实例继承祖父类的 getter 和 setter
    const parent = new Parent();
    const rp = reactive(parent);
    expect(rp.age).toBe(11); // 1 + 10
    rp.age = 30;
    expect(rp.id).toBe(20); // 30 - 10
    expect(rp.age).toBe(30); // 20 + 10
  });

  // 场景 8：三层继承中 setter 在中间层添加
  // C 有 getter，B 添加 setter，A 不覆盖
  // 注意：JavaScript 语言限制 — B 只定义 setter 会遮蔽 C 的 getter。
  it('三层继承 — C 有 getter，B 只添加 setter — JavaScript 语言限制', () => {
    class GrandParent {
      public id = 1;

      @ComputedPlanALazy()
      public get age() {
        return this.id + 10;
      }
      // 没有 setter
    }

    class Parent extends GrandParent {
      // 中间层只添加 setter，会遮蔽祖父类的 getter
      public set age(val: number) {
        this.id = val - 10;
      }
    }

    class Child extends Parent {
      // 不覆盖 getter 和 setter
    }

    const child = new Child();
    const r = reactive(child);

    // JavaScript 语言限制：Parent 只定义 setter 遮蔽了 GrandParent 的 getter
    expect(r.age).toBeUndefined();
  });

  // 场景 8b：正确做法 — 中间层同时定义 getter 和 setter
  it('三层继承 — C 有 getter，B 同时添加 getter+setter，A 不覆盖', () => {
    class GrandParent {
      public id = 1;

      @ComputedPlanALazy()
      public get age() {
        return this.id + 10;
      }
    }

    class Parent extends GrandParent {
      @ComputedPlanALazy()
      public get age() {
        return this.id + 10; // 保持与祖父类相同的逻辑
      }
      public set age(val: number) {
        this.id = val - 10;
      }
    }

    class Child extends Parent {
      // 不覆盖
    }

    const child = new Child();
    const r = reactive(child);

    expect(r.age).toBe(11); // 1 + 10

    r.age = 25;
    expect(r.id).toBe(15); // 25 - 10
    expect(r.age).toBe(25); // 15 + 10
  });

  // 场景 9：三层继承 — C 有 getter+setter，B 覆盖 setter，A 覆盖 getter
  it('三层继承 — C 有 getter+setter，B 覆盖 setter，A 覆盖 getter', () => {
    class GrandParent {
      public id = 1;

      @ComputedPlanALazy()
      public get age() {
        return this.id + 10;
      }
      public set age(val: number) {
        this.id = val - 10;
      }
    }

    class Parent extends GrandParent {
      // 覆盖 setter
      public set age(val: number) {
        this.id = val; // 直接赋值
      }
    }

    class Child extends Parent {
      @ComputedPlanALazy()
      public get age() {
        return this.id * 2;
      }
      // 不覆盖 setter，继承 Parent 的 setter
    }

    const child = new Child();
    const r = reactive(child);

    expect(r.age).toBe(2); // 1 * 2

    // 赋值触发 Parent 的 setter：id = 10（直接赋值）
    r.age = 10;
    expect(r.id).toBe(10);
    // getter 使用 Child 的逻辑：10 * 2 = 20
    expect(r.age).toBe(20);
  });

  // 场景 10：多个不同名 getter + setter 的组合
  it('多个不同名 getter + setter 的组合', () => {
    class DemoService {
      public firstName = 'John';
      public lastName = 'Doe';

      @ComputedPlanALazy()
      public get fullName() {
        return `${this.firstName} ${this.lastName}`;
      }
      public set fullName(val: string) {
        const [first, ...rest] = val.split(' ');
        this.firstName = first;
        this.lastName = rest.join(' ');
      }

      @ComputedPlanALazy()
      public get initials() {
        return `${this.firstName[0]}${this.lastName[0]}`;
      }
    }

    const demo = new DemoService();
    const r = reactive(demo);

    expect(r.fullName).toBe('John Doe');
    expect(r.initials).toBe('JD');

    // 通过 setter 修改
    r.fullName = 'Jane Smith';
    expect(r.firstName).toBe('Jane');
    expect(r.lastName).toBe('Smith');
    expect(r.fullName).toBe('Jane Smith');
    expect(r.initials).toBe('JS');
  });
});
