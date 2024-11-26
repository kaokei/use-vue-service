import 'reflect-metadata';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { AppService } from './AppService';
import { RootService } from './RootService';
import {
  declareAppProviders,
  declareRootProviders,
  useRootService,
} from '../../src/inversify';

describe('test7', () => {
  it('get DemoService instance', async () => {
    declareRootProviders([RootService]);
    const msg = 'Hello world';
    const wrapper = mount(DemoComp, {
      props: {
        msg,
      },
      global: {
        plugins: [declareAppProviders([AppService])],
      },
    });

    const rootService = useRootService(RootService);

    expect(wrapper.vm.service).toBeInstanceOf(DemoService);
    expect(wrapper.vm.appService).toBeInstanceOf(AppService);
    expect(wrapper.vm.rootService).toBeInstanceOf(RootService);
    expect(rootService).toBeInstanceOf(RootService);
    expect(wrapper.vm.rootService).toBe(rootService);

    expect(wrapper.get('.msg').text()).toBe(msg);
    expect(wrapper.get('.demo-count').text()).toBe('10');
    expect(wrapper.get('.app-count').text()).toBe('100');
    expect(wrapper.get('.root-count').text()).toBe('1000');

    await wrapper.get('.btn-demo-count').trigger('click');
    expect(wrapper.get('.msg').text()).toBe(msg);
    expect(wrapper.get('.demo-count').text()).toBe('20');
    expect(wrapper.get('.app-count').text()).toBe('100');
    expect(wrapper.get('.root-count').text()).toBe('1000');

    await wrapper.get('.btn-app-count').trigger('click');
    expect(wrapper.get('.msg').text()).toBe(msg);
    expect(wrapper.get('.demo-count').text()).toBe('20');
    expect(wrapper.get('.app-count').text()).toBe('200');
    expect(wrapper.get('.root-count').text()).toBe('1000');

    await wrapper.get('.btn-root-count').trigger('click');
    expect(wrapper.get('.msg').text()).toBe(msg);
    expect(wrapper.get('.demo-count').text()).toBe('20');
    expect(wrapper.get('.app-count').text()).toBe('200');
    expect(wrapper.get('.root-count').text()).toBe('2000');
  });
});
