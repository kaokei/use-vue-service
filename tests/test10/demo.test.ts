import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { OtherService } from './OtherService';
import { declareRootProviders, useRootService } from '@/index';

describe('test10', () => {
  it('get DemoService instance', async () => {
    declareRootProviders([DemoService]);
    declareRootProviders([OtherService]);

    const wrapper = mount(DemoComp);

    const demoService1 = useRootService(DemoService);
    const demoService2 = useRootService(DemoService);
    const otherService1 = useRootService(OtherService);
    const otherService2 = useRootService(OtherService);

    expect(demoService1).toBeInstanceOf(DemoService);
    expect(demoService2).toBeInstanceOf(DemoService);
    expect(otherService1).toBeInstanceOf(OtherService);
    expect(otherService2).toBeInstanceOf(OtherService);
    expect(demoService1).toBe(demoService2);
    expect(otherService1).toBe(otherService1);

    expect(demoService1).toBe(wrapper.vm.demoService1);
    expect(demoService1).toBe(wrapper.vm.demoService2);
    expect(demoService1).toBe(wrapper.vm.demoService3);
    expect(demoService1).toBe(wrapper.vm.demoService4);
    expect(otherService1).toBe(wrapper.vm.otherService1);
    expect(otherService1).toBe(wrapper.vm.otherService2);
    expect(otherService1).toBe(wrapper.vm.otherService3);
    expect(otherService1).toBe(wrapper.vm.otherService4);

    expect(wrapper.vm.demoService1).toBeInstanceOf(DemoService);
    expect(wrapper.vm.demoService2).toBeInstanceOf(DemoService);
    expect(wrapper.vm.demoService3).toBeInstanceOf(DemoService);
    expect(wrapper.vm.demoService4).toBeInstanceOf(DemoService);
    expect(wrapper.vm.otherService1).toBeInstanceOf(OtherService);
    expect(wrapper.vm.otherService2).toBeInstanceOf(OtherService);
    expect(wrapper.vm.otherService3).toBeInstanceOf(OtherService);
    expect(wrapper.vm.otherService4).toBeInstanceOf(OtherService);
    expect(wrapper.vm.demoService1).toBe(wrapper.vm.demoService2);
    expect(wrapper.vm.demoService1).toBe(wrapper.vm.demoService3);
    expect(wrapper.vm.demoService1).toBe(wrapper.vm.demoService4);
    expect(wrapper.vm.otherService1).toBe(wrapper.vm.otherService2);
    expect(wrapper.vm.otherService1).toBe(wrapper.vm.otherService3);
    expect(wrapper.vm.otherService1).toBe(wrapper.vm.otherService4);

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
