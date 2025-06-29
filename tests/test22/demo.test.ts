import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';

describe('test22', () => {
  it('get DemoService instance', async () => {
    const msg = 'Hello world';
    const wrapper = mount(DemoComp, {
      props: {
        msg,
      },
    });

    expect(wrapper.vm.service).toBeInstanceOf(DemoService);

    expect(wrapper.get('.msg').text()).toBe(msg);
    expect(wrapper.get('.count').text()).toBe('1');
    expect(wrapper.get('.age').text()).toBe('100');
    expect(wrapper.get('.name').text()).toBe('DemoService-100');
    expect(wrapper.get('.computedName').text()).toBe('DemoService-100');
    expect(wrapper.get('.count-parent').text()).toBe('1');
    expect(wrapper.get('.count-grand').text()).toBe('1');
    expect(wrapper.get('.count-base').text()).toBe('1');
    expect(wrapper.get('.count-other').text()).toBe('1');

    await wrapper.get('.btn-count').trigger('click');
    expect(wrapper.get('.msg').text()).toBe(msg);
    expect(wrapper.get('.count').text()).toBe('2');
    expect(wrapper.get('.age').text()).toBe('100');
    expect(wrapper.get('.name').text()).toBe('DemoService-100');
    expect(wrapper.get('.computedName').text()).toBe('DemoService-100');
    expect(wrapper.get('.count-parent').text()).toBe('1');
    expect(wrapper.get('.count-grand').text()).toBe('1');
    expect(wrapper.get('.count-base').text()).toBe('1');
    expect(wrapper.get('.count-other').text()).toBe('1');

    await wrapper.get('.btn-count').trigger('click');
    expect(wrapper.get('.msg').text()).toBe(msg);
    expect(wrapper.get('.count').text()).toBe('3');
    expect(wrapper.get('.age').text()).toBe('100');
    expect(wrapper.get('.name').text()).toBe('DemoService-100');
    expect(wrapper.get('.computedName').text()).toBe('DemoService-100');
    expect(wrapper.get('.count-parent').text()).toBe('1');
    expect(wrapper.get('.count-grand').text()).toBe('1');
    expect(wrapper.get('.count-base').text()).toBe('1');
    expect(wrapper.get('.count-other').text()).toBe('1');

    await wrapper.get('.btn-age').trigger('click');
    expect(wrapper.get('.msg').text()).toBe(msg);
    expect(wrapper.get('.count').text()).toBe('3');
    expect(wrapper.get('.age').text()).toBe('101');
    expect(wrapper.get('.name').text()).toBe('DemoService-101');
    expect(wrapper.get('.computedName').text()).toBe('DemoService-101');
    expect(wrapper.get('.count-parent').text()).toBe('1');
    expect(wrapper.get('.count-grand').text()).toBe('1');
    expect(wrapper.get('.count-base').text()).toBe('1');
    expect(wrapper.get('.count-other').text()).toBe('1');

    await wrapper.get('.btn-age').trigger('click');
    expect(wrapper.get('.msg').text()).toBe(msg);
    expect(wrapper.get('.count').text()).toBe('3');
    expect(wrapper.get('.age').text()).toBe('102');
    expect(wrapper.get('.name').text()).toBe('DemoService-102');
    expect(wrapper.get('.computedName').text()).toBe('DemoService-102');
    expect(wrapper.get('.count-parent').text()).toBe('1');
    expect(wrapper.get('.count-grand').text()).toBe('1');
    expect(wrapper.get('.count-base').text()).toBe('1');
    expect(wrapper.get('.count-other').text()).toBe('1');

    await wrapper.get('.btn-count-other').trigger('click');
    expect(wrapper.get('.msg').text()).toBe(msg);
    expect(wrapper.get('.count').text()).toBe('3');
    expect(wrapper.get('.age').text()).toBe('102');
    expect(wrapper.get('.name').text()).toBe('DemoService-102');
    expect(wrapper.get('.computedName').text()).toBe('DemoService-102');
    expect(wrapper.get('.count-parent').text()).toBe('1');
    expect(wrapper.get('.count-grand').text()).toBe('1');
    expect(wrapper.get('.count-base').text()).toBe('1');
    expect(wrapper.get('.count-other').text()).toBe('2');
  });
});
