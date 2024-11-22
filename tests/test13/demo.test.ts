import 'reflect-metadata';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';

describe('test13', () => {
  it('get DemoService instance', async () => {
    const msg = 'Hello world';

    expect(() => {
      mount(DemoComp, {
        props: {
          msg,
        },
      });
    }).toThrow('No matching bindings found for serviceIdentifier: DemoService');
  });
});
