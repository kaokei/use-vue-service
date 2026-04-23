// P3: declareAppProviders + declareRootProviders 同时存在
// useService 和 useAppService 取 app 级实例，不是 root 级
import { mount } from '@vue/test-utils';
import { App } from 'vue';
import { declareAppProvidersPlugin, declareRootProviders, useAppService, useRootService } from '@/index';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';

declareRootProviders([DemoService]);

describe('test24 - P3', () => {
  it('declareAppProviders + declareRootProviders 同时存在，useService/useAppService 取 app 级实例', () => {
    let rootApp!: App;

    const wrapper = mount(DemoComp, {
      global: {
        plugins: [
          (app: App) => { rootApp = app; },
          declareAppProvidersPlugin([DemoService]),
        ],
      },
    });

    const appService = useAppService(DemoService, rootApp);
    const rootService = useRootService(DemoService);

    expect(appService).toBeInstanceOf(DemoService);
    expect(rootService).toBeInstanceOf(DemoService);
    // app 级容器遮蔽了根容器，useService 和 useAppService 均取 app 级实例
    expect(wrapper.vm.demoService).toBe(appService);
    expect(appService).not.toBe(rootService);
  });
});
