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

describe('Raw 装饰器 — auto-accessor 用法（原始实例）', () => {
  it('初始值为对象时，应被 markRaw 标记', () => {
    class DemoService {
      @Raw()
      public accessor chart: any = { type: 'pie' };
    }

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

describe('Raw 装饰器 — auto-accessor 用法（reactive 代理）', () => {
  // 以下测试覆盖通过 reactive() 代理对象访问 accessor 属性的场景。
  // accessor 编译后使用私有字段（#A）存储值，Proxy 对象无法直接访问私有字段，
  // 因此 get/set 中必须使用 toRaw(this) 还原为原始对象，否则会抛出：
  // TypeError: Cannot read private member #A from an object whose class did not declare it

  it('通过 reactive 代理读取初始值，应正常返回且不被响应式代理', () => {
    class DemoService {
      @Raw()
      public accessor chart: any = { type: 'pie' };
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    expect(reactiveDemo.chart).toEqual({ type: 'pie' });
    expect(isReactive(reactiveDemo.chart)).toBe(false);
  });

  it('通过 reactive 代理赋值新对象，新值应被 markRaw 标记', () => {
    class DemoService {
      @Raw()
      public accessor chart: any = null;
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    const newObj = { type: 'scatter' };
    reactiveDemo.chart = newObj;

    expect(isReactive(reactiveDemo.chart)).toBe(false);
    expect(reactiveDemo.chart).toBe(newObj);
  });

  it('通过 reactive 代理赋值非对象时，原样保留', () => {
    class DemoService {
      @Raw()
      public accessor value: any = null;
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    reactiveDemo.value = 'hello';
    expect(reactiveDemo.value).toBe('hello');

    reactiveDemo.value = 42;
    expect(reactiveDemo.value).toBe(42);

    reactiveDemo.value = false;
    expect(reactiveDemo.value).toBe(false);
  });

  it('通过 reactive 代理多次赋值对象，每次都应被 markRaw 标记', () => {
    class DemoService {
      @Raw()
      public accessor instance: any = null;
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

describe('Raw 装饰器 — 不带括号用法 @Raw', () => {
  it('field：不带括号，初始值对象应被 markRaw 标记', () => {
    class DemoService {
      @Raw
      public chart: any = { type: 'bar' };
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    expect(isReactive(reactiveDemo.chart)).toBe(false);
  });

  it('field：不带括号，赋值新对象应被 markRaw 标记', () => {
    class DemoService {
      @Raw
      public chart: any = null;
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    const newObj = { type: 'line' };
    reactiveDemo.chart = newObj;

    expect(isReactive(reactiveDemo.chart)).toBe(false);
    expect(reactiveDemo.chart).toBe(newObj);
  });

  it('accessor：不带括号，初始值对象应被 markRaw 标记', () => {
    class DemoService {
      @Raw
      public accessor chart: any = { type: 'pie' };
    }

    const demo = new DemoService();
    expect(isReactive(demo.chart)).toBe(false);
  });

  it('accessor：不带括号，赋值新对象应被 markRaw 标记', () => {
    class DemoService {
      @Raw
      public accessor chart: any = null;
    }

    const demo = new DemoService();
    const newObj = { type: 'scatter' };
    demo.chart = newObj;

    expect(isReactive(demo.chart)).toBe(false);
    expect(demo.chart).toBe(newObj);
  });

  it('accessor：不带括号，通过 reactive 代理读取初始值应正常工作', () => {
    class DemoService {
      @Raw
      public accessor chart: any = { type: 'pie' };
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    expect(reactiveDemo.chart).toEqual({ type: 'pie' });
    expect(isReactive(reactiveDemo.chart)).toBe(false);
  });

  it('accessor：不带括号，通过 reactive 代理赋值新对象应被 markRaw 标记', () => {
    class DemoService {
      @Raw
      public accessor chart: any = null;
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    const newObj = { type: 'scatter' };
    reactiveDemo.chart = newObj;

    expect(isReactive(reactiveDemo.chart)).toBe(false);
    expect(reactiveDemo.chart).toBe(newObj);
  });
});
