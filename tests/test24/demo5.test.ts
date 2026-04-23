// N4: useAppService 可以从 declareAppProviders 中获取服务
import { mount } from '@vue/test-utils';
import { App } from 'vue';
import { declareAppProvidersPlugin, useAppService } from '@/index';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';

describe('test24 - N4', () => {
  it('useAppService 从 declareAppProviders 获取服务', () => {
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

    expect(appService).toBeInstanceOf(DemoService);
    // useService 在组件内获取的是同一个 app 级实例
    expect(wrapper.vm.demoService).toBe(appService);
  });
});
