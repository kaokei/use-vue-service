import 'reflect-metadata';
import { mount } from '@vue/test-utils';
import ParentDemo from './ParentComp.vue';
import DemoComp from './DemoComp.vue';

describe('test2', () => {
  it('get DemoService instance', async () => {
    const wrapper = mount(ParentDemo);
    const demoCompWrapper = wrapper.getComponent(DemoComp);

    expect(wrapper.get('.count').text()).toBe('1');
    expect(wrapper.get('.age').text()).toBe('100');
    expect(wrapper.get('.name').text()).toBe('nihao-DemoService-100');
    expect(wrapper.get('.computedName').text()).toBe('nihao-DemoService-100');

    await wrapper.get('.btn-count').trigger('click');
    let countEvent = demoCompWrapper.emitted('count');
    expect(countEvent).toHaveLength(1);
    expect(countEvent && countEvent[0]).toEqual([2]);
    expect(wrapper.get('.count').text()).toBe('2');
    expect(wrapper.get('.age').text()).toBe('100');
    expect(wrapper.get('.name').text()).toBe('nihao-DemoService-100');
    expect(wrapper.get('.computedName').text()).toBe('nihao-DemoService-100');

    await wrapper.get('.btn-count').trigger('click');
    countEvent = demoCompWrapper.emitted('count');
    expect(countEvent).toHaveLength(2);
    expect(countEvent && countEvent[1]).toEqual([3]);
    expect(wrapper.get('.count').text()).toBe('3');
    expect(wrapper.get('.age').text()).toBe('100');
    expect(wrapper.get('.name').text()).toBe('nihao-DemoService-100');
    expect(wrapper.get('.computedName').text()).toBe('nihao-DemoService-100');

    await wrapper.get('.btn-age').trigger('click');
    expect(wrapper.get('.count').text()).toBe('3');
    expect(wrapper.get('.age').text()).toBe('101');
    expect(wrapper.get('.name').text()).toBe('nihao-DemoService-101');
    expect(wrapper.get('.computedName').text()).toBe('nihao-DemoService-101');

    await wrapper.get('.btn-age').trigger('click');
    expect(wrapper.get('.count').text()).toBe('3');
    expect(wrapper.get('.age').text()).toBe('102');
    expect(wrapper.get('.name').text()).toBe('nihao-DemoService-102');
    expect(wrapper.get('.computedName').text()).toBe('nihao-DemoService-102');

    await wrapper.get('.btn-parent-age').trigger('click');
    expect(wrapper.get('.count').text()).toBe('3');
    expect(wrapper.get('.age').text()).toBe('103');
    expect(wrapper.get('.name').text()).toBe('nihao-DemoService-103');
    expect(wrapper.get('.computedName').text()).toBe('nihao-DemoService-103');

    await wrapper.get('.btn-parent-count').trigger('click');
    countEvent = demoCompWrapper.emitted('count');
    expect(countEvent).toHaveLength(3);
    expect(countEvent && countEvent[2]).toEqual([4]);
    expect(wrapper.get('.count').text()).toBe('4');
    expect(wrapper.get('.age').text()).toBe('103');
    expect(wrapper.get('.name').text()).toBe('nihao-DemoService-103');
    expect(wrapper.get('.computedName').text()).toBe('nihao-DemoService-103');
  });
});
