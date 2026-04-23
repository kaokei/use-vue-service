// P1: declareProviders + declareAppProviders 同时存在，useService 取组件级实例
import { mount } from '@vue/test-utils';
import { App } from 'vue';
import { declareAppProvidersPlugin, useAppService } from '@/index';
import DemoCompWithProviders from './DemoCompWithProviders.vue';
import { DemoService } from './DemoService';

describe('test24 - P1', () => {
  it('declareProviders + declareAppProviders 同时存在，useService 取组件级实例', () => {
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

    expect(wrapper.vm.demoService).toBeInstanceOf(DemoService);
    expect(appService).toBeInstanceOf(DemoService);
    // useService 优先取组件级容器的实例，与 app 级实例不同
    expect(wrapper.vm.demoService).not.toBe(appService);
  });
});
