import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { OtherService } from './OtherService';

describe('test3', () => {
  it('get DemoService instance', async () => {
    const wrapper = mount(DemoComp);

    expect(wrapper.vm.demoService).toBeInstanceOf(DemoService);
    expect(wrapper.vm.otherService).toBeInstanceOf(OtherService);
    expect(wrapper.vm.demoService.otherService).toBe(wrapper.vm.otherService);

    expect(wrapper.get('.demo-count').text()).toBe('100');
    expect(wrapper.get('.demo-sum').text()).toBe('300');
    expect(wrapper.get('.other-count').text()).toBe('200');

    await wrapper.get('.btn-demo').trigger('click');
    expect(wrapper.get('.demo-count').text()).toBe('101');
    expect(wrapper.get('.demo-sum').text()).toBe('301');
    expect(wrapper.get('.other-count').text()).toBe('200');

    await wrapper.get('.btn-demo').trigger('click');
    expect(wrapper.get('.demo-count').text()).toBe('102');
    expect(wrapper.get('.demo-sum').text()).toBe('302');
    expect(wrapper.get('.other-count').text()).toBe('200');

    await wrapper.get('.btn-other').trigger('click');
    expect(wrapper.get('.demo-count').text()).toBe('102');
    expect(wrapper.get('.demo-sum').text()).toBe('303');
    expect(wrapper.get('.other-count').text()).toBe('201');

    await wrapper.get('.btn-other').trigger('click');
    expect(wrapper.get('.demo-count').text()).toBe('102');
    expect(wrapper.get('.demo-sum').text()).toBe('304');
    expect(wrapper.get('.other-count').text()).toBe('202');
  });
});
