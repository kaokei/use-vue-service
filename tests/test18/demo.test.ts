import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';

describe('test18', () => {
  it('get DemoService instance', async () => {
    expect(() => {
      mount(DemoComp);
    }).not.toThrowError();
  });
});
