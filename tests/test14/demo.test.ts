import 'reflect-metadata';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { useRootService } from '../../src';

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
      useRootService(DemoService);
    }).toThrow('No matching bindings found for serviceIdentifier: DemoService');
  });
});
