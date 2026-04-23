import { mount } from '@vue/test-utils';
import { type App, nextTick } from 'vue';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { useAppService, declareAppProvidersPlugin } from '@/index';

describe('RunInScope — DI 容器集成（组件卸载自动销毁）', () => {
  it('组件挂载期间 watchEffect 正常响应数据变化', async () => {
    const wrapper = mount(DemoComp);
    const { demoService } = wrapper.vm;

    // DemoComp 在挂载时调用 demoService.setup()，watchEffect 首次同步执行一次
    expect(demoService.setupCallCount).toBe(1);

    // 修改响应式数据，watchEffect 再次执行
    demoService.count++;
    await nextTick();
    expect(demoService.setupCallCount).toBe(2);
  });

  it('组件 unmount 后 watchEffect 副作用自动停止', async () => {
    const wrapper = mount(DemoComp);
    const { demoService } = wrapper.vm;

    expect(demoService.setupCallCount).toBe(1);

    wrapper.unmount();

    // unmount 触发服务销毁（onUnmounted → container.destroy() → removeScope）
    demoService.count++;
    await nextTick();
    expect(demoService.setupCallCount).toBe(1); // 不再响应
  });

  it('多个组件实例各自独立，unmount 一个不影响另一个', async () => {
    const wrapper1 = mount(DemoComp);
    const wrapper2 = mount(DemoComp);

    const service1 = wrapper1.vm.demoService;
    const service2 = wrapper2.vm.demoService;

    // 两个实例是独立的
    expect(service1).not.toBe(service2);
    expect(service1.setupCallCount).toBe(1);
    expect(service2.setupCallCount).toBe(1);

    wrapper1.unmount();

    // service1 已销毁
    service1.count++;
    await nextTick();
    expect(service1.setupCallCount).toBe(1); // 已停止

    // service2 仍响应
    service2.count++;
    await nextTick();
    expect(service2.setupCallCount).toBe(2); // 仍响应

    wrapper2.unmount();
  });

  it('App 卸载后，组件内服务的 @RunInScope 副作用停止', async () => {
    let rootApp!: App;

    const wrapper = mount(DemoComp, {
      global: {
        plugins: [
          (app: App) => {
            rootApp = app;
          },
          declareAppProvidersPlugin([]),
        ],
      },
    });

    const { demoService } = wrapper.vm;
    expect(demoService.setupCallCount).toBe(1);

    // App 卸载（wrapper.unmount 会卸载整个 App）
    wrapper.unmount();

    demoService.count++;
    await nextTick();
    expect(demoService.setupCallCount).toBe(1); // 不再响应

    void rootApp; // 仅用于保持引用，避免 ts 警告
  });
});
