import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { ChildService } from './ChildService';
import { findService, findAllServices } from '@/index';

describe('test19', () => {
  it('get DemoService instance', async () => {
    const wrapper = mount(DemoComp);

    const childService = findService(wrapper.vm.component1, ChildService);

    const childServiceList = findAllServices(
      wrapper.vm.component1,
      ChildService
    );

    expect(childService).toBeInstanceOf(ChildService);

    expect(childServiceList.length).toBe(3);

    expect(childService).toBe(childServiceList[0]);
  });
});
