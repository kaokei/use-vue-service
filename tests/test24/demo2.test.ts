// 场景2：useService 可以从 declareRootProviders 中获取服务，并且没有配置 declareProviders
import { mount } from '@vue/test-utils';
import { declareRootProviders, useRootService } from '@/index';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';

declareRootProviders([DemoService]);

describe('test24 - 场景2', () => {
  it('useService 从 declareRootProviders 获取服务（无 declareProviders）', async () => {
    const wrapper = mount(DemoComp);

    expect(wrapper.vm.demoService).toBeInstanceOf(DemoService);
    // 没有 app 容器，useService fallback 到根容器，获取的是根容器中的全局单例
    const rootDemoService = useRootService(DemoService);
    expect(wrapper.vm.demoService).toBe(rootDemoService);
  });
});
