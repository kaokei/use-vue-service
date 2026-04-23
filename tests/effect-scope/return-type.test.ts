import { reactive, watchEffect } from 'vue';
import type { EffectScope } from 'vue';
import { RunInScope } from '@/index';

describe('RunInScope — 类型声明模式', () => {
  it('方案 1：调用侧 as unknown as EffectScope 强制转换', () => {
    class DemoService {
      public value = 0;

      @RunInScope
      public setup() {
        watchEffect(() => {
          void this.value;
        });
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    const scope = reactiveDemo.setup() as unknown as EffectScope;

    expect(scope.active).toBe(true);
    expect(typeof scope.stop).toBe('function');
    expect(typeof scope.run).toBe('function');
    expect(Array.isArray(scope.effects)).toBe(true);
    expect(scope.effects.length).toBe(1);

    scope.stop();
    expect(scope.active).toBe(false);
  });

  it('方案 2：方法声明 : EffectScope + return null as unknown as EffectScope，调用侧无需转换', () => {
    class DemoService {
      public value = 0;

      @RunInScope
      public setup(): EffectScope {
        watchEffect(() => {
          void this.value;
        });
        return null as unknown as EffectScope;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    const scope = reactiveDemo.setup(); // 无需类型转换

    expect(scope.active).toBe(true);
    expect(typeof scope.stop).toBe('function');
    expect(typeof scope.run).toBe('function');
    expect(Array.isArray(scope.effects)).toBe(true);
    expect(scope.effects.length).toBe(1);

    scope.stop();
    expect(scope.active).toBe(false);
  });

  it('两种方案的 scope 功能完全等价', () => {
    class DemoService1 {
      public value = 0;

      @RunInScope
      public setup() {
        watchEffect(() => {
          void this.value;
        });
      }
    }

    class DemoService2 {
      public value = 0;

      @RunInScope
      public setup(): EffectScope {
        watchEffect(() => {
          void this.value;
        });
        return null as unknown as EffectScope;
      }
    }

    const scope1 = reactive(new DemoService1()).setup() as unknown as EffectScope;
    const scope2 = reactive(new DemoService2()).setup();

    // 两种方案具有相同的属性和行为
    expect(scope1.active).toBe(scope2.active); // 都是 true
    expect(scope1.effects.length).toBe(scope2.effects.length); // 都是 1

    scope1.stop();
    scope2.stop();

    expect(scope1.active).toBe(false);
    expect(scope2.active).toBe(false);
  });
});
