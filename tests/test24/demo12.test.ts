// E6: 仅 declareAppProviders 声明服务，useRootService 无法跨级获取，抛出异常
import { mount } from '@vue/test-utils';
import { declareAppProvidersPlugin, useRootService } from '@/index';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';

describe('test24 - E6', () => {
  it('仅 declareAppProviders 声明服务，useRootService 抛出异常', () => {
    // app 容器注册了 DemoService，但根容器没有
    mount(DemoComp, {
      global: {
        plugins: [declareAppProvidersPlugin([DemoService])],
      },
    });

    // useRootService 只查根容器，未注册 DemoService
    expect(() => {
      useRootService(DemoService);
    }).toThrow('No matching binding found for token: DemoService');
  });
});
