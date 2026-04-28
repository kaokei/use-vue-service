import { reactive, isReactive } from 'vue';
import { Raw } from '@/index';

describe('Raw 装饰器 — field 初始值验证', () => {
  it('@Raw() field：初始值应能正常读取（不为 undefined）', () => {
    class DemoService {
      @Raw()
      public config: any = { version: '1.0.0' };
    }

    const demo = new DemoService();
    expect(demo.config).not.toBeUndefined();
    expect(demo.config).toEqual({ version: '1.0.0' });
  });

  it('@Raw field（不带括号）：初始值应能正常读取', () => {
    class DemoService {
      @Raw
      public config: any = { version: '1.0.0' };
    }

    const demo = new DemoService();
    expect(demo.config).not.toBeUndefined();
    expect(demo.config).toEqual({ version: '1.0.0' });
  });

  it('@Raw() field：通过 reactive 代理读取初始值应不为 undefined', () => {
    class DemoService {
      @Raw()
      public config: any = { version: '1.0.0', author: 'kaokei' };
    }

    const demo = new DemoService();
    const r = reactive(demo);
    expect(r.config).not.toBeUndefined();
    expect(r.config.version).toBe('1.0.0');
  });
});

describe('Raw 装饰器 — accessor 初始值验证', () => {
  it('@Raw() accessor：初始值应能正常读取（不为 undefined）', () => {
    class DemoService {
      @Raw()
      public accessor config: any = { version: '1.0.0' };
    }

    const demo = new DemoService();
    expect(demo.config).not.toBeUndefined();
    expect(demo.config).toEqual({ version: '1.0.0' });
  });

  it('@Raw accessor（不带括号）：初始值应能正常读取', () => {
    class DemoService {
      @Raw
      public accessor config: any = { version: '1.0.0' };
    }

    const demo = new DemoService();
    expect(demo.config).not.toBeUndefined();
    expect(demo.config).toEqual({ version: '1.0.0' });
  });

  it('@Raw() accessor：通过 reactive 代理读取初始值应不为 undefined', () => {
    class DemoService {
      @Raw()
      public accessor config: any = { version: '1.0.0', author: 'kaokei' };
    }

    const demo = new DemoService();
    const r = reactive(demo);
    expect(r.config).not.toBeUndefined();
    expect(r.config.version).toBe('1.0.0');
  });

  it('@Raw() accessor：初始值为非对象时原样保留', () => {
    class DemoService {
      @Raw()
      public accessor count: any = 42;
    }

    const demo = new DemoService();
    expect(demo.count).toBe(42);
  });

  it('@Raw() accessor：初始值应被 markRaw 标记（不被响应式代理）', () => {
    class DemoService {
      @Raw()
      public accessor config: any = { version: '1.0.0' };
    }

    const demo = new DemoService();
    const r = reactive(demo);
    expect(isReactive(r.config)).toBe(false);
  });
});
