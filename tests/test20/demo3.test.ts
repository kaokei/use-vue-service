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
      public set age(val: number) {
        this.id = val - 100;
      }

      public getAge() {
        return this.id + 10;
      }
    }

    const spyOnGetAge = vi.spyOn(DemoService.prototype, 'getAge');

    const demo1 = new DemoService();
    const reactiveDemo = reactive(demo1);

    expect(reactiveDemo).toBeInstanceOf(DemoService);
    expect(reactiveDemo.id).toBe(1);
    expect(reactiveDemo.name).toBe('demo');
    expect(spyOnGetAge).not.toHaveBeenCalled();
    reactiveDemo.age = 105; // 实际上是设置 id = 5
    expect(spyOnGetAge).toHaveBeenCalledOnce();
    expect(reactiveDemo.age).toBe(115);
    expect(spyOnGetAge).toHaveBeenCalledTimes(2);
    expect(reactiveDemo.age).toBe(115);
    expect(spyOnGetAge).toHaveBeenCalledTimes(2);
    reactiveDemo.id = 2;
    expect(reactiveDemo.age).toBe(112);
    expect(spyOnGetAge).toHaveBeenCalledTimes(3);
    expect(reactiveDemo.age).toBe(112);
    expect(spyOnGetAge).toHaveBeenCalledTimes(3);
  });
});
