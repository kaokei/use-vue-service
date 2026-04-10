import { ComputedPlanB } from '@/index';
import { reactive, watchEffect, nextTick, effectScope } from 'vue';

describe('Plan_B — 响应式能力', () => {
  // 测试：依赖变化后重新计算（需求 3.1）
  it('依赖变化后重新计算', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanB()
      public get age() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    expect(reactiveDemo.age).toBe(11);

    reactiveDemo.id = 2;
    expect(reactiveDemo.age).toBe(12);

    reactiveDemo.id = 100;
    expect(reactiveDemo.age).toBe(110);
  });

  // 测试：watchEffect 中的响应式追踪（需求 3.2）
  it('watchEffect 中的响应式追踪', async () => {
    class DemoService {
      public id = 1;

      @ComputedPlanB()
      public get age() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    const collected: number[] = [];
    const scope = effectScope();

    scope.run(() => {
      watchEffect(() => {
        collected.push(reactiveDemo.age);
      });
    });

    // watchEffect 立即执行一次
    expect(collected).toEqual([11]);

    // 修改依赖属性
    reactiveDemo.id = 2;
    await nextTick();

    expect(collected).toEqual([11, 12]);

    // 再次修改依赖属性
    reactiveDemo.id = 5;
    await nextTick();

    expect(collected).toEqual([11, 12, 15]);

    // 清理 scope
    scope.stop();
  });

  // 测试：多 getter 独立缓存（需求 3.3）
  it('多 getter 独立缓存', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanB()
      public get age() {
        return this.id + 10;
      }

      @ComputedPlanB()
      public get score() {
        return this.id * 2;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // 初始值
    expect(reactiveDemo.age).toBe(11);
    expect(reactiveDemo.score).toBe(2);

    // 修改共享依赖
    reactiveDemo.id = 5;

    // 每个 getter 独立返回各自正确的计算结果
    expect(reactiveDemo.age).toBe(15);
    expect(reactiveDemo.score).toBe(10);

    // 再次修改
    reactiveDemo.id = 10;
    expect(reactiveDemo.age).toBe(20);
    expect(reactiveDemo.score).toBe(20);
  });

  // 测试：连续多次修改依赖（需求 3.1）
  it('连续多次修改依赖，每次访问 getter 都返回正确的最新值', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanB()
      public get age() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    expect(reactiveDemo.age).toBe(11);

    reactiveDemo.id = 2;
    expect(reactiveDemo.age).toBe(12);

    reactiveDemo.id = 3;
    expect(reactiveDemo.age).toBe(13);

    reactiveDemo.id = 100;
    expect(reactiveDemo.age).toBe(110);

    reactiveDemo.id = -5;
    expect(reactiveDemo.age).toBe(5);

    reactiveDemo.id = 0;
    expect(reactiveDemo.age).toBe(10);
  });

  // 测试：缓存有效性 — 依赖未变化时不重新计算（需求 3.1）
  it('缓存有效性 — 依赖未变化时不重新计算', () => {
    const computeAgeFn = vi.fn();

    class DemoService {
      public id = 1;

      @ComputedPlanB()
      public get age() {
        computeAgeFn();
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    expect(computeAgeFn).not.toHaveBeenCalled();

    // 首次访问，触发计算
    expect(reactiveDemo.age).toBe(11);
    expect(computeAgeFn).toHaveBeenCalledTimes(1);

    // 依赖未变化，多次访问不应重新计算
    expect(reactiveDemo.age).toBe(11);
    expect(reactiveDemo.age).toBe(11);
    expect(reactiveDemo.age).toBe(11);
    expect(computeAgeFn).toHaveBeenCalledTimes(1);

    // 修改依赖后，访问应触发重新计算
    reactiveDemo.id = 2;
    expect(reactiveDemo.age).toBe(12);
    expect(computeAgeFn).toHaveBeenCalledTimes(2);

    // 依赖再次未变化，多次访问不应重新计算
    expect(reactiveDemo.age).toBe(12);
    expect(reactiveDemo.age).toBe(12);
    expect(computeAgeFn).toHaveBeenCalledTimes(2);
  });
});
