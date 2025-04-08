import { MarkRaw } from '@/index';
import { reactive, isReactive, markRaw } from 'vue';
import { Container } from '@kaokei/di';

describe('test20', () => {
  it('get DemoService instance', async () => {
    const originalObj = { name: 'demo' };

    class DemoService {
      public id = 1;
      public name = 'demo';

      public rawObj = originalObj;
    }

    const demo = new DemoService();
    const reactiveDemo = demo;

    expect(isReactive(reactiveDemo)).toBe(false);
    expect(isReactive(reactiveDemo.rawObj)).toBe(false);
    expect(reactiveDemo.rawObj).toBe(originalObj);
  });

  it('get DemoService instance', async () => {
    const originalObj = { name: 'demo' };

    class DemoService {
      public id = 1;
      public name = 'demo';

      public rawObj = originalObj;
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    expect(isReactive(reactiveDemo)).toBe(true);
    expect(isReactive(reactiveDemo.rawObj)).toBe(true);
    expect(reactiveDemo.rawObj).not.toBe(originalObj);
  });

  it('get DemoService instance', async () => {
    const originalObj = { name: 'demo' };
    const originalObj2 = { name: 'demo2' };
    const originalObj3 = { name: 'demo3' };

    class DemoService {
      public id = 1;
      public name = 'demo';

      public rawObj = originalObj;
    }

    const demo: any = new DemoService();

    const key = 'rawObj';
    demo[Symbol.for(key)] = markRaw(demo.rawObj);

    Object.defineProperty(demo, key, {
      configurable: true,
      enumerable: true,
      get() {
        return demo[Symbol.for(key)];
      },
      set(value: any) {
        demo[Symbol.for(key)] = markRaw(value);
      },
    });

    const reactiveDemo = reactive(demo);

    expect(isReactive(reactiveDemo)).toBe(true);
    expect(isReactive(reactiveDemo.rawObj)).toBe(false);
    expect(reactiveDemo.rawObj).toBe(originalObj);

    reactiveDemo.rawObj = originalObj2;
    expect(isReactive(reactiveDemo)).toBe(true);
    expect(isReactive(reactiveDemo.rawObj)).toBe(false);
    expect(reactiveDemo.rawObj).toBe(originalObj2);

    reactiveDemo.rawObj = originalObj3;
    expect(isReactive(reactiveDemo)).toBe(true);
    expect(isReactive(reactiveDemo.rawObj)).toBe(false);
    expect(reactiveDemo.rawObj).toBe(originalObj3);
  });

  it('get DemoService instance', async () => {
    const originalObj = { name: 'demo' };
    const originalObj2 = { name: 'demo2' };
    const originalObj3 = { name: 'demo3' };

    class DemoService {
      public id = 1;
      public name = 'demo';

      @MarkRaw
      public rawObj = originalObj;
    }

    const container = new Container();
    container.bind(DemoService).toSelf();

    const reactiveDemo = container.get(DemoService);

    expect(isReactive(reactiveDemo)).toBe(true);
    expect(isReactive(reactiveDemo.rawObj)).toBe(false);
    expect(reactiveDemo.rawObj).not.toBe(originalObj);

    reactiveDemo.rawObj = originalObj2;
    expect(isReactive(reactiveDemo)).toBe(true);
    expect(isReactive(reactiveDemo.rawObj)).toBe(false);
    expect(reactiveDemo.rawObj).toBe(originalObj2);

    reactiveDemo.rawObj = originalObj3;
    expect(isReactive(reactiveDemo)).toBe(true);
    expect(isReactive(reactiveDemo.rawObj)).toBe(false);
    expect(reactiveDemo.rawObj).toBe(originalObj3);
  });
});
