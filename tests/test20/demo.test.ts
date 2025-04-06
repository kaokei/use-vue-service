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

  it('get DemoService instance', async () => {
    class DemoService {
      public id = 1;
      public name = 'demo';

      @Computed
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

    expect(reactiveDemo.age).toBe(111);

    expect(spyOnGetAge).toHaveBeenCalledTimes(1);

    expect(reactiveDemo.age).toBe(111);

    expect(spyOnGetAge).toHaveBeenCalledTimes(1);
  });

  it('get DemoService instance', async () => {
    class DemoService {
      public id = 1;
      public name = 'demo';

      @Computed
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

      @Computed
      public get age() {
        return this.getAge() + 100;
      }

      @Computed
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
