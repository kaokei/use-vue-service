// E1: 无任何声明，useService 获取服务时抛出异常
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';

describe('test24 - E1', () => {
  it('useService 在无任何声明时抛出异常', () => {
    expect(() => {
      mount(DemoComp);
    }).toThrow('No matching binding found for token: DemoService');
  });
});
