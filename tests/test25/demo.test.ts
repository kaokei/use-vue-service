/**
 * 验证 useAppService 和 useService 在多层组件嵌套时的查找行为差异。
 *
 * 结构：app(绑定SharedService) → RootComp → Comp1(绑定) → Comp2(绑定) → Comp3(绑定)
 * 在 Comp3 中：
 *   - useService(SharedService)         → 从 Comp3 自己的容器获取（最近层）
 *   - useAppService(SharedService, app) → 从 app 级容器获取（最顶层）
 */
import { mount } from '@vue/test-utils';
import type { App } from 'vue';
import { declareAppProvidersPlugin, useAppService } from '@/index';
import RootComp from './RootComp.vue';
import Comp3 from './Comp3.vue';
import { SharedService } from './SharedService';

describe('test25 — useAppService vs useService 多层嵌套查找行为', () => {
  it('useService 取最近容器（comp3），useAppService 取 app 级容器，两者是不同实例', () => {
    let rootApp!: App;

    const wrapper = mount(RootComp, {
      global: {
        plugins: [
          (app: App) => {
            rootApp = app;
          },
          // app 级绑定 SharedService
          declareAppProvidersPlugin([SharedService]),
        ],
      },
    });

    const comp3Wrapper = wrapper.getComponent(Comp3);
    const serviceFromComponent = comp3Wrapper.vm.serviceFromComponent;
    const serviceFromApp = comp3Wrapper.vm.serviceFromApp;

    // 两者都是 SharedService 实例
    expect(serviceFromComponent).toBeInstanceOf(SharedService);
    expect(serviceFromApp).toBeInstanceOf(SharedService);

    // useService 从 comp3 容器取，useAppService 从 app 容器取，是不同实例
    expect(serviceFromComponent).not.toBe(serviceFromApp);
  });

  it('useAppService 在组件内和测试中调用返回同一实例（均来自 app 容器）', () => {
    let rootApp!: App;

    const wrapper = mount(RootComp, {
      global: {
        plugins: [
          (app: App) => {
            rootApp = app;
          },
          declareAppProvidersPlugin([SharedService]),
        ],
      },
    });

    const comp3Wrapper = wrapper.getComponent(Comp3);
    const serviceFromApp = comp3Wrapper.vm.serviceFromApp;

    // 在测试中直接通过 rootApp 调用 useAppService，应该拿到同一个实例
    const serviceDirectly = useAppService(SharedService, rootApp);

    expect(serviceFromApp).toBe(serviceDirectly);
  });
});
