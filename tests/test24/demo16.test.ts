// P4: 三级同时存在，useService 取组件级，useAppService 取 app 级，useRootService 取 root 级
import { mount } from '@vue/test-utils';
import { App } from 'vue';
import { declareAppProvidersPlugin, declareRootProviders, useAppService, useRootService } from '@/index';
import DemoCompWithProviders from './DemoCompWithProviders.vue';
import { DemoService } from './DemoService';

declareRootProviders([DemoService]);

describe('test24 - P4', () => {
  it('三级同时存在，三种 API 各取对应层级的独立实例', () => {
    let rootApp!: App;

    const wrapper = mount(DemoCompWithProviders, {
      global: {
        plugins: [
          (app: App) => { rootApp = app; },
          declareAppProvidersPlugin([DemoService]),
        ],
      },
    });

    const appService = useAppService(DemoService, rootApp);
    const rootService = useRootService(DemoService);

    expect(wrapper.vm.demoService).toBeInstanceOf(DemoService);
    expect(appService).toBeInstanceOf(DemoService);
    expect(rootService).toBeInstanceOf(DemoService);

    // 三个实例互不相同
    expect(wrapper.vm.demoService).not.toBe(appService);
    expect(wrapper.vm.demoService).not.toBe(rootService);
    expect(appService).not.toBe(rootService);
  });
});
