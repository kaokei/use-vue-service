import 'reflect-metadata';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { OtherService } from './OtherService';
import { declareAppProviders } from '../../src/inversify';

describe('test9', () => {
  it('get DemoService instance', async () => {
    const wrapper = mount(DemoComp, {
      global: {
        plugins: [
          declareAppProviders([DemoService]),
          declareAppProviders([OtherService]),
        ],
      },
    });

    expect(wrapper.vm.demoService1).toBeInstanceOf(DemoService);
    expect(wrapper.vm.demoService2).toBeInstanceOf(DemoService);
    expect(wrapper.vm.otherService1).toBeInstanceOf(OtherService);
    expect(wrapper.vm.otherService2).toBeInstanceOf(OtherService);
    expect(wrapper.vm.demoService1).toBe(wrapper.vm.demoService2);
    expect(wrapper.vm.otherService1).toBe(wrapper.vm.otherService2);

    expect(wrapper.get('.demo1-count').text()).toBe('100');
    expect(wrapper.get('.demo2-count').text()).toBe('100');
    expect(wrapper.get('.other1-count').text()).toBe('200');
    expect(wrapper.get('.other2-count').text()).toBe('200');

    await wrapper.get('.btn-demo1').trigger('click');
    expect(wrapper.get('.demo1-count').text()).toBe('101');
    expect(wrapper.get('.demo2-count').text()).toBe('101');
    expect(wrapper.get('.other1-count').text()).toBe('200');
    expect(wrapper.get('.other2-count').text()).toBe('200');

    await wrapper.get('.btn-demo2').trigger('click');
    expect(wrapper.get('.demo1-count').text()).toBe('102');
    expect(wrapper.get('.demo2-count').text()).toBe('102');
    expect(wrapper.get('.other1-count').text()).toBe('200');
    expect(wrapper.get('.other2-count').text()).toBe('200');

    await wrapper.get('.btn-other1').trigger('click');
    expect(wrapper.get('.demo1-count').text()).toBe('102');
    expect(wrapper.get('.demo2-count').text()).toBe('102');
    expect(wrapper.get('.other1-count').text()).toBe('201');
    expect(wrapper.get('.other2-count').text()).toBe('201');

    await wrapper.get('.btn-other2').trigger('click');
    expect(wrapper.get('.demo1-count').text()).toBe('102');
    expect(wrapper.get('.demo2-count').text()).toBe('102');
    expect(wrapper.get('.other1-count').text()).toBe('202');
    expect(wrapper.get('.other2-count').text()).toBe('202');
  });
});
