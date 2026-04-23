// N1: useService 可以从 declareProviders 中获取服务
import { mount } from '@vue/test-utils';
import DemoCompWithProviders from './DemoCompWithProviders.vue';
import { DemoService } from './DemoService';

describe('test24 - N1', () => {
  it('useService 从 declareProviders 获取服务', () => {
    const wrapper = mount(DemoCompWithProviders);

    expect(wrapper.vm.demoService).toBeInstanceOf(DemoService);
    expect(wrapper.get('.demo-count').text()).toBe('1');
  });
});
