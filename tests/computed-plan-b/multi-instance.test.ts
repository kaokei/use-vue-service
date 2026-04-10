import { ComputedPlanB } from './computed-plan-b';
import { reactive } from 'vue';

describe('Plan_B — 多实例隔离', () => {
  // 测试：两个实例隔离 — 修改实例 A 的依赖不影响实例 B 的 getter 返回值（需求 6.1, 6.2）
  it('两个实例隔离 — 修改实例 A 不影响实例 B', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanB()
      public get age() {
        return this.id + 10;
      }
    }

    const demoA = new DemoService();
    const reactiveA = reactive(demoA);

    const demoB = new DemoService();
    const reactiveB = reactive(demoB);

    // 初始值相同
    expect(reactiveA.age).toBe(11);
    expect(reactiveB.age).toBe(11);

    // 修改实例 A 的依赖
    reactiveA.id = 100;

    // 实例 A 的 getter 返回新值
    expect(reactiveA.age).toBe(110);
    // 实例 B 的 getter 返回值不受影响
    expect(reactiveB.age).toBe(11);

    // 修改实例 B 的依赖
    reactiveB.id = 50;

    // 各自返回正确的值
    expect(reactiveA.age).toBe(110);
    expect(reactiveB.age).toBe(60);
  });

  // 测试：多实例独立缓存 — 每个实例各自独立创建 ComputedRef 缓存（需求 6.1）
  it('多实例独立缓存 — 各自独立创建 ComputedRef', () => {
    const computeFn = vi.fn();

    class DemoService {
      public id: number;

      constructor(id = 1) {
        this.id = id;
      }

      @ComputedPlanB()
      public get age() {
        computeFn();
        return this.id + 10;
      }
    }

    const demoA = new DemoService(1);
    const reactiveA = reactive(demoA);

    const demoB = new DemoService(2);
    const reactiveB = reactive(demoB);

    expect(computeFn).not.toHaveBeenCalled();

    // 访问实例 A，触发实例 A 的 ComputedRef 创建
    expect(reactiveA.age).toBe(11);
    expect(computeFn).toHaveBeenCalledTimes(1);

    // 访问实例 B，触发实例 B 的 ComputedRef 创建（独立于 A）
    expect(reactiveB.age).toBe(12);
    expect(computeFn).toHaveBeenCalledTimes(2);

    // 再次访问实例 A，使用缓存，不重新计算
    expect(reactiveA.age).toBe(11);
    expect(computeFn).toHaveBeenCalledTimes(2);

    // 再次访问实例 B，使用缓存，不重新计算
    expect(reactiveB.age).toBe(12);
    expect(computeFn).toHaveBeenCalledTimes(2);
  });
});
