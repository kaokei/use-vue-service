// P2: declareProviders + declareRootProviders 同时存在，useService 取组件级实例
import { mount } from '@vue/test-utils';
import { declareRootProviders, useRootService } from '@/index';
import DemoCompWithProviders from './DemoCompWithProviders.vue';
import { DemoService } from './DemoService';

declareRootProviders([DemoService]);

describe('test24 - P2', () => {
  it('declareProviders + declareRootProviders 同时存在，useService 取组件级实例', () => {
    const wrapper = mount(DemoCompWithProviders);

    const rootService = useRootService(DemoService);

    expect(wrapper.vm.demoService).toBeInstanceOf(DemoService);
    expect(rootService).toBeInstanceOf(DemoService);
    // useService 优先取组件级容器的实例，与根容器实例不同
    expect(wrapper.vm.demoService).not.toBe(rootService);
  });
});
