import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { useService } from '@/index';

describe('test12', () => {
  it('get DemoService instance', async () => {
    const msg = 'Hello world';
    const wrapper = mount(DemoComp, {
      props: {
        msg,
      },
    });

    expect(wrapper.vm.service).toBeInstanceOf(DemoService);

    expect(() => {
      useService(DemoService);
    }).toThrow("Cannot read properties of undefined (reading 'get')");
  });
});
