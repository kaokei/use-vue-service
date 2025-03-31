import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { OtherService } from './OtherService';
import { App } from 'vue';
import { declareAppProviders, useAppService } from '@/index';

describe('test17', () => {
  it('get DemoService instance', async () => {
    expect(() => {
      mount(DemoComp);
    }).toThrowError('No matching binding found for token: DemoService');
  });

  it('get DemoService instance', async () => {
    let rootApp!: App;

    const plugin = (app: any) => {
      console.log('declareAppProviders plugin run');
      declareAppProviders([DemoService, OtherService], app);
    };

    const wrapper = mount(DemoComp, {
      global: {
        plugins: [
          (app: App) => {
            rootApp = app;
          },
          plugin,
        ],
      },
    });

    const demoService = useAppService(DemoService, rootApp);
    const otherService = useAppService(OtherService, rootApp);

    expect(wrapper.vm.demoService).toBeInstanceOf(DemoService);
    expect(wrapper.vm.otherService).toBeInstanceOf(OtherService);

    expect(wrapper.vm.demoService).toBe(demoService);
    expect(wrapper.vm.otherService).not.toBe(otherService);

    rootApp.unmount();
  });
});
