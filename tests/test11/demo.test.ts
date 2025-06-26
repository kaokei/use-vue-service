import { flushPromises, mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { router, TYPES } from './router';
import { declareRootProviders, getRootService } from '@/index';
import { markRaw, App } from 'vue';
import { useRoute } from 'vue-router';

describe('test11', () => {
  it('get DemoService instance', async () => {
    declareRootProviders(container => {
      container
        .bind(TYPES.router)
        .toConstantValue(router)
        .onActivation((_: any, instance: any) => {
          return markRaw(instance);
        });
    });

    router.push('/');
    await router.isReady();

    const msg = 'Hello world';
    const wrapper = mount(DemoComp, {
      props: {
        msg,
      },
      global: {
        plugins: [
          router,
          (app: App) => {
            app.runWithContext(() => {
              const route = useRoute();
              declareRootProviders(container => {
                container
                  .bind(TYPES.route)
                  .toConstantValue(route)
                  .onActivation((_: any, instance: any) => {
                    return markRaw(instance);
                  });
              });
            });
          },
        ],
      },
    });

    const rootRoute = getRootService(TYPES.route);
    const rootRouter = getRootService(TYPES.router);

    expect(wrapper.vm.service).toBeInstanceOf(DemoService);
    expect(router).toBe(rootRouter);
    expect(router).toBe(wrapper.vm.router);
    expect(router).toBe(wrapper.vm.rootRouter);
    expect(router).toBe(wrapper.vm.service.router);
    expect(rootRoute).toBe(wrapper.vm.rootRoute);
    expect(rootRouter).toBe(wrapper.vm.rootRouter);
    expect(rootRoute).toBe(wrapper.vm.service.route);
    expect(rootRouter).toBe(wrapper.vm.service.router);

    expect(wrapper.get('.msg').text()).toBe(msg);
    expect(wrapper.get('.count').text()).toBe('1');
    expect(wrapper.get('.fullpath1').text()).toBe('/');
    expect(wrapper.get('.fullpath2').text()).toBe('/');
    expect(wrapper.get('.fullpath3').text()).toBe('/');
    expect(wrapper.get('.fullpath4').text()).toBe('/');
    expect(wrapper.get('.main-content').text()).toBe('HomeView');

    await wrapper.get('.btn-count').trigger('click');
    expect(wrapper.get('.msg').text()).toBe(msg);
    expect(wrapper.get('.count').text()).toBe('2');
    expect(wrapper.get('.fullpath1').text()).toBe('/');
    expect(wrapper.get('.fullpath2').text()).toBe('/');
    expect(wrapper.get('.fullpath3').text()).toBe('/');
    expect(wrapper.get('.fullpath4').text()).toBe('/');
    expect(wrapper.get('.main-content').text()).toBe('HomeView');

    await wrapper.get('.btn-count').trigger('click');
    expect(wrapper.get('.msg').text()).toBe(msg);
    expect(wrapper.get('.count').text()).toBe('3');
    expect(wrapper.get('.fullpath1').text()).toBe('/');
    expect(wrapper.get('.fullpath2').text()).toBe('/');
    expect(wrapper.get('.fullpath3').text()).toBe('/');
    expect(wrapper.get('.fullpath4').text()).toBe('/');
    expect(wrapper.get('.main-content').text()).toBe('HomeView');

    await wrapper.get('.route-about').trigger('click');
    await flushPromises();
    expect(wrapper.get('.msg').text()).toBe(msg);
    expect(wrapper.get('.count').text()).toBe('3');
    expect(wrapper.get('.fullpath1').text()).toBe('/about');
    expect(wrapper.get('.fullpath2').text()).toBe('/about');
    expect(wrapper.get('.fullpath3').text()).toBe('/about');
    expect(wrapper.get('.fullpath4').text()).toBe('/about');
    expect(wrapper.get('.main-content').text()).toBe('AboutView');

    await wrapper.get('.route-home').trigger('click');
    await flushPromises();
    expect(wrapper.get('.msg').text()).toBe(msg);
    expect(wrapper.get('.count').text()).toBe('3');
    expect(wrapper.get('.fullpath1').text()).toBe('/');
    expect(wrapper.get('.fullpath2').text()).toBe('/');
    expect(wrapper.get('.fullpath3').text()).toBe('/');
    expect(wrapper.get('.fullpath4').text()).toBe('/');
    expect(wrapper.get('.main-content').text()).toBe('HomeView');
  });
});
