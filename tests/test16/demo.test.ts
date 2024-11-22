import 'reflect-metadata';
import { mount } from '@vue/test-utils';
import { declareRootProviders, useService, useRootService } from '../../src';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { App } from 'vue';

describe('test16', () => {
  it('get DemoService instance', async () => {
    declareRootProviders([DemoService]);
    const rootDemoService = useRootService(DemoService);
    let appDemoService: DemoService | undefined = undefined;
    const wrapper = mount(DemoComp, {
      global: {
        plugins: [
          (app: App) => {
            app.runWithContext(() => {
              appDemoService = useService(DemoService);
            });
          },
        ],
      },
    });

    expect(rootDemoService).toBeInstanceOf(DemoService);
    expect(appDemoService).toBeInstanceOf(DemoService);
    expect(rootDemoService).toBe(appDemoService);

    expect(wrapper.vm.service).toBeInstanceOf(DemoService);
    expect(wrapper.vm.service).not.toBe(appDemoService);
    expect(wrapper.vm.service).not.toBe(rootDemoService);
  });
});
