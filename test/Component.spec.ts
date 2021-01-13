import 'reflect-metadata';
import { mount } from '@vue/test-utils';

import Counter from '../example/components/Counter.vue';

jest.unmock('vue');

describe('Component', () => {
  it('渲染组件、获取服务数据', async () => {
    const wrapper = mount(Counter, {
      props: {
        name: 'counter1',
      },
    });
    expect(wrapper.find('h1').text()).toBe('counter1');
    expect(wrapper.find('.countNum').text()).toBe('0');

    await wrapper.find('button').trigger('click');
    expect(wrapper.find('.countNum').text()).toBe('1');
  });

  it('组件快照、服务共享', async () => {
    const wrapper = mount(Counter, {
      props: {
        name: 'counter2',
      },
    });
    expect(wrapper.find('h1').text()).toBe('counter2');
    // 共享service的原因
    expect(wrapper.find('.countNum').text()).toBe('1');
    await wrapper.vm.$nextTick();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
