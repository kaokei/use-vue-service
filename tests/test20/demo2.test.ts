import { Computed } from '@/index';
import { reactive } from 'vue';

describe('test20', () => {
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

    const demo1 = new DemoService();
    const reactiveDemo1 = reactive(demo1);

    const demo2 = new DemoService();
    const reactiveDemo2 = reactive(demo2);

    expect(reactiveDemo1).toBeInstanceOf(DemoService);
    expect(reactiveDemo1.id).toBe(1);
    expect(reactiveDemo1.name).toBe('demo');
    expect(spyOnGetAge).not.toHaveBeenCalled();
    expect(reactiveDemo1.age).toBe(111);
    expect(spyOnGetAge).toHaveBeenCalledOnce();
    reactiveDemo1.id = 2;
    expect(spyOnGetAge).toHaveBeenCalledOnce();
    expect(reactiveDemo1.age).toBe(112);
    expect(spyOnGetAge).toHaveBeenCalledTimes(2);
    expect(reactiveDemo1.age).toBe(112);
    expect(spyOnGetAge).toHaveBeenCalledTimes(2);

    expect(reactiveDemo2).toBeInstanceOf(DemoService);
    expect(reactiveDemo2.id).toBe(1);
    expect(reactiveDemo2.name).toBe('demo');
    expect(spyOnGetAge).toHaveBeenCalledTimes(2);
    expect(reactiveDemo2.age).toBe(111);
    expect(spyOnGetAge).toHaveBeenCalledTimes(3);
  });
});
