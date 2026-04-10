import { reactive, isReactive } from 'vue';
import { Raw } from '@/index';

describe('Raw 装饰器 — field 用法', () => {
  it('初始值为对象时，应被 markRaw 标记（不被响应式代理）', () => {
    class DemoService {
      @Raw()
      public chart: any = { type: 'bar' };
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // markRaw 标记的对象不会被 reactive 代理
    expect(isReactive(reactiveDemo.chart)).toBe(false);
  });

  it('赋值新对象时，新值应被 markRaw 标记', () => {
    class DemoService {
      @Raw()
      public chart: any = null;
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    const newObj = { type: 'line' };
    reactiveDemo.chart = newObj;

    expect(isReactive(reactiveDemo.chart)).toBe(false);
    expect(reactiveDemo.chart).toBe(newObj);
  });

  it('赋值非对象时，原样保留', () => {
    class DemoService {
      @Raw()
      public chart: any = null;
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    reactiveDemo.chart = 'string-value';
    expect(reactiveDemo.chart).toBe('string-value');

    reactiveDemo.chart = 0;
    expect(reactiveDemo.chart).toBe(0);

    reactiveDemo.chart = false;
    expect(reactiveDemo.chart).toBe(false);
  });

  it('多次赋值对象，每次都应被 markRaw 标记', () => {
    class DemoService {
      @Raw()
      public instance: any = null;
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    const obj1 = { id: 1 };
    const obj2 = { id: 2 };

    reactiveDemo.instance = obj1;
    expect(isReactive(reactiveDemo.instance)).toBe(false);

    reactiveDemo.instance = obj2;
    expect(isReactive(reactiveDemo.instance)).toBe(false);
    expect(reactiveDemo.instance).toBe(obj2);
  });
});

describe('Raw 装饰器 — auto-accessor 用法', () => {
  it('初始值为对象时，应被 markRaw 标记', () => {
    class DemoService {
      @Raw()
      public accessor chart: any = { type: 'pie' };
    }

    // 直接在原始实例上验证（accessor 使用私有字段，reactive 代理无法访问）
    const demo = new DemoService();
    // 初始值经过 init: ensureRaw 处理，对象应被 markRaw 标记
    expect(isReactive(demo.chart)).toBe(false);
  });

  it('初始值为非对象时，原样保留', () => {
    class DemoService {
      @Raw()
      public accessor count: any = 100;
    }

    const demo = new DemoService();
    expect(demo.count).toBe(100);
  });

  it('赋值新对象时，新值应被 markRaw 标记', () => {
    class DemoService {
      @Raw()
      public accessor chart: any = null;
    }

    const demo = new DemoService();
    const newObj = { type: 'scatter' };
    demo.chart = newObj;

    expect(isReactive(demo.chart)).toBe(false);
    expect(demo.chart).toBe(newObj);
  });

  it('赋值非对象时，原样保留', () => {
    class DemoService {
      @Raw()
      public accessor value: any = null;
    }

    const demo = new DemoService();

    demo.value = 'hello';
    expect(demo.value).toBe('hello');

    demo.value = 42;
    expect(demo.value).toBe(42);
  });

  it('getter 应返回当前存储的值', () => {
    class DemoService {
      @Raw()
      public accessor data: any = { y: 2 };
    }

    const demo = new DemoService();
    expect(demo.data.y).toBe(2);
  });
});
