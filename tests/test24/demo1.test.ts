// 场景1：useService 可以从 declareAppProviders 中获取服务，并且没有配置 declareProviders
import { mount } from '@vue/test-utils';
import { declareAppProvidersPlugin, useRootService } from '@/index';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';

describe('test24 - 场景1', () => {
  it('useService 从 declareAppProviders 获取服务（无 declareProviders）', async () => {
    const wrapper = mount(DemoComp, {
      global: {
        plugins: [declareAppProvidersPlugin([DemoService])],
      },
    });

    expect(wrapper.vm.demoService).toBeInstanceOf(DemoService);
    // DemoService 未注册到根容器，useService 从 app 容器获取
    expect(() => useRootService(DemoService)).toThrow();
  });
});
