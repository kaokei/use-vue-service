import 'reflect-metadata';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { OtherService } from './OtherService';
import { App } from 'vue';
import { declareAppProviders } from '../../src';

describe('test17', () => {
  it('get DemoService instance', async () => {
    const wrapper = mount(DemoComp);

    expect(wrapper.vm.demoService).toBeInstanceOf(DemoService);
    expect(wrapper.vm.otherService).toBeInstanceOf(OtherService);

    wrapper.unmount();
  });

  it('get DemoService instance', async () => {
    let rootApp!: App;

    const wrapper = mount(DemoComp, {
      global: {
        plugins: [
          (app: App) => {
            rootApp = app;
          },
          declareAppProviders([DemoService, OtherService]),
        ],
      },
    });

    expect(wrapper.vm.demoService).toBeInstanceOf(DemoService);
    expect(wrapper.vm.otherService).toBeInstanceOf(OtherService);

    rootApp.unmount();
  });
});
