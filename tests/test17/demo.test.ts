import 'reflect-metadata';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { OtherService } from './OtherService';

describe('test17', () => {
  it('get DemoService instance', async () => {
    const wrapper = mount(DemoComp);

    expect(wrapper.vm.demoService).toBeInstanceOf(DemoService);
    expect(wrapper.vm.otherService).toBeInstanceOf(OtherService);
  });
});
