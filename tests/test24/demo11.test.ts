// E5: 仅 declareProviders 声明服务，useRootService 无法跨级获取，抛出异常
import { mount } from '@vue/test-utils';
import { useRootService } from '@/index';
import DemoCompWithProviders from './DemoCompWithProviders.vue';
import { DemoService } from './DemoService';

describe('test24 - E5', () => {
  it('仅 declareProviders 声明服务，useRootService 抛出异常', () => {
    // 组件内通过 declareProviders 注册了 DemoService
    const wrapper = mount(DemoCompWithProviders);

    expect(wrapper.vm.demoService).toBeInstanceOf(DemoService);

    // useRootService 只查根容器，未注册 DemoService
    expect(() => {
      useRootService(DemoService);
    }).toThrow('No matching binding found for token: DemoService');
  });
});
