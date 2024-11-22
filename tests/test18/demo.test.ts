import 'reflect-metadata';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';

describe('test18', () => {
  it('get DemoService instance', async () => {
    expect(() => {
      mount(DemoComp);
    }).toThrow(
      'Circular dependency found: Symbol(DemoService) --> Symbol(OtherService) --> Symbol(DemoService)'
    );
  });
});
