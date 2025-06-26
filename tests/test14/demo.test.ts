import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { getRootService } from '@/index';

describe('test14', () => {
  it('get DemoService instance', async () => {
    const msg = 'Hello world';
    const wrapper = mount(DemoComp, {
      props: {
        msg,
      },
    });

    expect(wrapper.vm.service).toBeInstanceOf(DemoService);

    expect(() => {
      getRootService(DemoService);
    }).toThrow('No matching binding found for token: DemoService');
  });
});
