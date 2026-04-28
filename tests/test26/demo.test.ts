import { mount } from '@vue/test-utils';
import { nextTick, reactive } from 'vue';
import DemoComp from './DemoComp.vue';
import { WatchService } from './WatchService';

describe('@PostConstruct 内调用 @RunInScope 方法', () => {
  it('useService 获取实例时 watchEffect 已自动建立并执行一次', async () => {
    const wrapper = mount(DemoComp);
    const { watchService } = wrapper.vm;

    // @PostConstruct 自动调用了 startWatch()，watchEffect 同步执行一次
    expect(watchService.watchCallCount).toBe(1);
    expect(watchService.scope).not.toBeNull();
    expect(watchService.scope!.active).toBe(true);
  });

  it('count 变化后 watchEffect 自动响应', async () => {
    const wrapper = mount(DemoComp);
    const { watchService } = wrapper.vm;

    expect(watchService.watchCallCount).toBe(1);

    watchService.count++;
    await nextTick();
    expect(watchService.watchCallCount).toBe(2);

    watchService.count++;
    await nextTick();
    expect(watchService.watchCallCount).toBe(3);
  });

  it('调用 scope.stop() 后 watchEffect 停止响应', async () => {
    const wrapper = mount(DemoComp);
    const { watchService } = wrapper.vm;

    expect(watchService.watchCallCount).toBe(1);

    watchService.scope!.stop();

    watchService.count++;
    await nextTick();
    // 已 stop，不再触发
    expect(watchService.watchCallCount).toBe(1);
  });

  it('组件 unmount 后服务销毁，watchEffect 停止响应', async () => {
    const wrapper = mount(DemoComp);
    const { watchService } = wrapper.vm;

    expect(watchService.watchCallCount).toBe(1);

    wrapper.unmount();

    watchService.count++;
    await nextTick();
    // 容器销毁触发 removeScope，不再响应
    expect(watchService.watchCallCount).toBe(1);
  });

  it('不经过 DI 容器时，直接 new 实例也能正常工作', () => {
    const instance = new WatchService();
    const reactiveInstance = reactive(instance);

    // @PostConstruct 在 DI 实例化时调用，直接 new 不触发 PostConstruct
    // 这里验证手动调用 startWatch() 的行为
    expect(reactiveInstance.watchCallCount).toBe(0);

    const scope = reactiveInstance.startWatch();
    // watchEffect 同步执行一次
    expect(reactiveInstance.watchCallCount).toBe(1);
    expect(scope.active).toBe(true);

    scope.stop();
  });
});
