import { Computed } from '@/index';
import { reactive } from 'vue';

describe('test20', () => {
  it('get DemoService instance', async () => {
    class DemoService {
      public id = 1;
      public name = 'demo';

      public get age() {
        return this.getAge() + 100;
      }

      public getAge() {
        return this.id + 10;
      }
    }

    const spyOnGetAge = vi.spyOn(DemoService.prototype, 'getAge');

    const demo = new DemoService();
    const reactiveDemo = demo;

    expect(reactiveDemo).toBeInstanceOf(DemoService);

    expect(reactiveDemo.id).toBe(1);
    expect(reactiveDemo.name).toBe('demo');

    expect(spyOnGetAge).not.toHaveBeenCalled();

    expect(reactiveDemo.age).toBe(111);

    expect(spyOnGetAge).toHaveBeenCalledOnce();

    reactiveDemo.id = 2;

    expect(spyOnGetAge).toHaveBeenCalledOnce();

    expect(reactiveDemo.age).toBe(112);

    expect(spyOnGetAge).toHaveBeenCalledTimes(2);

    expect(reactiveDemo.age).toBe(112);

    expect(spyOnGetAge).toHaveBeenCalledTimes(3);
  });

  it('get DemoService instance - 非 reactive 场景', async () => {
    class DemoService {
      public id = 1;
      public name = 'demo';

      @Computed()
      public get age() {
        return this.getAge() + 100;
      }

      public getAge() {
        return this.id + 10;
      }
    }

    const spyOnGetAge = vi.spyOn(DemoService.prototype, 'getAge');

    const demo = new DemoService();
    const reactiveDemo = demo;

    expect(reactiveDemo).toBeInstanceOf(DemoService);

    expect(reactiveDemo.id).toBe(1);
    expect(reactiveDemo.name).toBe('demo');

    expect(spyOnGetAge).not.toHaveBeenCalled();

    // 首次访问：触发新 getter，创建 ComputedRef 并写入实例
    // 非 reactive 场景无 Auto_Unwrap，返回 ComputedRef 对象本身
    const { isRef } = await import('vue');
    expect(isRef(reactiveDemo.age)).toBe(true);

    // ComputedRef 是懒计算，仅创建但未求值，getAge 尚未被调用
    expect(spyOnGetAge).toHaveBeenCalledTimes(0);

    reactiveDemo.id = 2;

    expect(spyOnGetAge).toHaveBeenCalledTimes(0);

    // 后续访问：非 reactive 场景下，数据属性是 ComputedRef 对象本身（无 Auto_Unwrap）
    // 所以返回的是 ComputedRef 对象，而非解包后的值
    expect(isRef(reactiveDemo.age)).toBe(true);

    expect(spyOnGetAge).toHaveBeenCalledTimes(0);

    expect(isRef(reactiveDemo.age)).toBe(true);

    expect(spyOnGetAge).toHaveBeenCalledTimes(0);
  });

  it('get DemoService instance', async () => {
    class DemoService {
      public id = 1;
      public name = 'demo';

      @Computed()
      public get age() {
        return this.getAge() + 100;
      }

      public getAge() {
        return this.id + 10;
      }
    }

    const spyOnGetAge = vi.spyOn(DemoService.prototype, 'getAge');

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    expect(reactiveDemo).toBeInstanceOf(DemoService);

    expect(reactiveDemo.id).toBe(1);
    expect(reactiveDemo.name).toBe('demo');

    expect(spyOnGetAge).not.toHaveBeenCalled();

    expect(reactiveDemo.age).toBe(111);

    expect(spyOnGetAge).toHaveBeenCalledOnce();

    reactiveDemo.id = 2;

    expect(spyOnGetAge).toHaveBeenCalledOnce();

    expect(reactiveDemo.age).toBe(112);

    expect(spyOnGetAge).toHaveBeenCalledTimes(2);

    expect(reactiveDemo.age).toBe(112);

    expect(spyOnGetAge).toHaveBeenCalledTimes(2);
  });

  it('get DemoService instance', async () => {
    class DemoService {
      public id = 1;
      public name = 'demo';

      @Computed()
      public get age() {
        return this.getAge() + 100;
      }

      @Computed()
      public get age2() {
        return this.getAge() + 200;
      }

      public getAge() {
        return this.id + 10;
      }
    }

    const spyOnGetAge = vi.spyOn(DemoService.prototype, 'getAge');

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    expect(reactiveDemo).toBeInstanceOf(DemoService);

    expect(reactiveDemo.id).toBe(1);
    expect(reactiveDemo.name).toBe('demo');

    expect(spyOnGetAge).not.toHaveBeenCalled();

    expect(reactiveDemo.age).toBe(111);

    expect(spyOnGetAge).toHaveBeenCalledOnce();

    reactiveDemo.id = 2;

    expect(spyOnGetAge).toHaveBeenCalledOnce();

    expect(reactiveDemo.age).toBe(112);

    expect(spyOnGetAge).toHaveBeenCalledTimes(2);

    expect(reactiveDemo.age).toBe(112);

    expect(spyOnGetAge).toHaveBeenCalledTimes(2);

    expect(reactiveDemo.age2).toBe(212);

    expect(spyOnGetAge).toHaveBeenCalledTimes(3);

    expect(reactiveDemo.age2).toBe(212);

    expect(spyOnGetAge).toHaveBeenCalledTimes(3);

    expect(reactiveDemo.age).toBe(112);

    expect(spyOnGetAge).toHaveBeenCalledTimes(3);

    expect(reactiveDemo.age).toBe(112);

    expect(spyOnGetAge).toHaveBeenCalledTimes(3);
  });
});
