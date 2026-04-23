import { reactive, ref, watchEffect, nextTick } from 'vue';
import { RunInScope } from '@/index';
import type { EffectScope } from 'vue';

describe('RunInScope — 带参数方法的参数传递', () => {
  it('带单个参数，参数值在 watchEffect 闭包内可正常访问', async () => {
    const trigger = ref(0);
    let callCount = 0;

    class DemoService {
      @RunInScope
      public setup(multiplier: number): EffectScope {
        watchEffect(() => {
          void trigger.value;
          callCount += multiplier;
        });
        return null as unknown as EffectScope;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    reactiveDemo.setup(3);
    expect(callCount).toBe(3); // 首次同步执行，累加 multiplier=3

    trigger.value++;
    await nextTick();
    expect(callCount).toBe(6); // 再次执行，再次累加 3
  });

  it('参数通过闭包捕获，多次调用传不同 label，各自独立追加日志', async () => {
    const trigger = ref(0);
    const log: string[] = [];

    class DemoService {
      @RunInScope
      public setup(label: string): EffectScope {
        watchEffect(() => {
          void trigger.value;
          log.push(label);
        });
        return null as unknown as EffectScope;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    reactiveDemo.setup('A'); // 首次执行：log = ['A']
    reactiveDemo.setup('B'); // 首次执行：log = ['A', 'B']

    expect(log).toEqual(['A', 'B']);

    trigger.value++;
    await nextTick();
    // 两个 watchEffect 都响应
    expect(log).toEqual(['A', 'B', 'A', 'B']);
  });

  it('多次调用传不同参数，stop 中间 scope 后只有该 scope 的副作用停止', async () => {
    const trigger = ref(0);
    let count1 = 0;
    let count2 = 0;
    let count3 = 0;

    class DemoService {
      @RunInScope
      public setup(increment: number): EffectScope {
        watchEffect(() => {
          void trigger.value;
          if (increment === 1) count1 += increment;
          else if (increment === 10) count2 += increment;
          else if (increment === 100) count3 += increment;
        });
        return null as unknown as EffectScope;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    reactiveDemo.setup(1);
    const scope2 = reactiveDemo.setup(10);
    reactiveDemo.setup(100);

    // 首次同步执行
    expect(count1).toBe(1);
    expect(count2).toBe(10);
    expect(count3).toBe(100);

    scope2.stop();
    trigger.value++;
    await nextTick();

    expect(count1).toBe(2);    // 仍响应
    expect(count2).toBe(10);   // 已停止
    expect(count3).toBe(200);  // 仍响应
  });

  it('带多个参数，所有参数均正确传递到方法体', () => {
    let result = 0;

    class DemoService {
      @RunInScope
      public setup(a: number, b: number): EffectScope {
        watchEffect(() => {
          result = a + b;
        });
        return null as unknown as EffectScope;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    const scope = reactiveDemo.setup(3, 4);

    expect(result).toBe(7);
    expect(scope.active).toBe(true);
  });
});
