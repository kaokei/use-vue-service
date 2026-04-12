import { Computed } from '@/index';
import { reactive } from 'vue';

describe('test20', () => {
  it('get DemoService instance', async () => {
    class DemoService {
      public id = 1;
      public name = 'demo';

      @Computed()
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
    // 注意：需要先访问 getter 触发 ComputedRef 创建，
    // 然后赋值才能正确触发 writable computed 的 setter。
    // 在实际 DI 场景中，组件渲染时会自然先读取属性。
    expect(reactiveDemo.age).toBe(111);
    expect(spyOnGetAge).toHaveBeenCalledOnce();
    reactiveDemo.age = 105; // 实际上是设置 id = 5
    // writable computed 的 set 回调触发 setter，setter 修改 id = 5
    // computed 是惰性的，不会立即重新计算，所以 getAge 调用次数不变
    expect(spyOnGetAge).toHaveBeenCalledOnce();
    // 访问 age 触发 computed 重新计算：5 + 10 + 100 = 115
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
