import 'reflect-metadata';

import { mount } from '@vue/test-utils';

import Counter from '../example/components/Counter.vue';

import CounterService from '../example/services/counter.service';

import { useService } from '@src/index';

describe('Component', () => {
  const counterService = useService(CounterService);

  test('渲染组件、获取服务数据', async () => {
    const wrapper = mount(Counter, {
      props: {
        name: 'counter1',
        counter: counterService,
      },
    });
    expect(wrapper.find('.title').text()).toBe('counter1:');
    expect(wrapper.find('.countNum').text()).toBe('0');

    await wrapper.find('.incrementBtn').trigger('click');
    expect(wrapper.find('.countNum').text()).toBe('1');

    await wrapper.find('.decrementBtn').trigger('click');
    expect(wrapper.find('.countNum').text()).toBe('0');

    counterService.add(10);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.countNum').text()).toBe('10');

    counterService.minus(5);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.countNum').text()).toBe('5');
  });

  test('组件快照、服务共享', async () => {
    const wrapper = mount(Counter, {
      props: {
        name: 'counter2',
        counter: counterService,
      },
    });
    expect(wrapper.find('.title').text()).toBe('counter2:');
    // 共享service的原因
    expect(wrapper.find('.countNum').text()).toBe('5');
    await wrapper.vm.$nextTick();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
