import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';

describe('DemoComp', () => {
  it('get DemoService instance', () => {
    const msg = 'Hello world';
    const wrapper = mount(DemoComp, {
      props: {
        msg,
      },
    });
    expect(wrapper.get('.msg').text()).toBe(msg);
    expect(wrapper.get('.name').text()).toBe('demo');
    expect(wrapper.get('.age').text()).toBe('100');
  });
});
