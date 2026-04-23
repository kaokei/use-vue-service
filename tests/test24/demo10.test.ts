// E4: 仅 declareProviders 声明服务，useAppService 无法跨级获取，抛出异常
import { mount } from '@vue/test-utils';
import { App } from 'vue';
import { useAppService } from '@/index';
import DemoCompWithProviders from './DemoCompWithProviders.vue';
import { DemoService } from './DemoService';

describe('test24 - E4', () => {
  it('仅 declareProviders 声明服务，useAppService 抛出异常', () => {
    let rootApp!: App;

    // 组件内通过 declareProviders 注册了 DemoService
    mount(DemoCompWithProviders, {
      global: {
        plugins: [
          (app: App) => { rootApp = app; },
        ],
      },
    });

    // useAppService 查找 app 容器和根容器，均未注册 DemoService
    expect(() => {
      useAppService(DemoService, rootApp);
    }).toThrow('No matching binding found for token: DemoService');
  });
});
