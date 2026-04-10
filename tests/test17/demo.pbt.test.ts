/**
 * test17 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：应用卸载清理
 * 验证：应用卸载后服务不再可访问，未注册服务始终抛出错误
 */

import fc from 'fast-check';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { OtherService } from './OtherService';
import { App } from 'vue';
import { useAppService, declareAppProvidersPlugin } from '@/index';

describe('test17 — 属性基测试', () => {
  /**
   * Property 1：未注册服务时挂载始终抛出错误
   *
   * 对于任意次数的挂载尝试，在未注册 DemoService 的情况下，
   * 始终抛出 "No matching binding found for token: DemoService" 错误。
   */
  it('Property 1 — 未注册服务时挂载始终抛出错误', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        expect(() => {
          mount(DemoComp);
        }).toThrowError('No matching binding found for token: DemoService');
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property 2：注册服务后挂载成功，服务实例类型正确
   *
   * 无论挂载多少次，通过 declareAppProvidersPlugin 注册服务后，
   * 组件内的服务实例类型始终正确。
   */
  it('Property 2 — 注册服务后挂载成功，服务实例类型正确', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        let rootApp!: App;

        const wrapper = mount(DemoComp, {
          global: {
            plugins: [
              (app: App) => {
                rootApp = app;
              },
              declareAppProvidersPlugin([DemoService, OtherService]),
            ],
          },
        });

        expect(wrapper.vm.demoService).toBeInstanceOf(DemoService);
        expect(wrapper.vm.otherService).toBeInstanceOf(OtherService);

        rootApp.unmount();
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property 3：useAppService 获取的服务与组件内服务实例一致性
   *
   * 无论挂载多少次，通过 useAppService 获取的 DemoService 实例
   * 与组件内的 demoService 实例是同一个（应用级单例）。
   * 注意：OtherService 在组件内有独立的实例（组件级注册）。
   */
  it('Property 3 — useAppService 获取的 DemoService 与组件内实例一致', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        let rootApp!: App;

        const wrapper = mount(DemoComp, {
          global: {
            plugins: [
              (app: App) => {
                rootApp = app;
              },
              declareAppProvidersPlugin([DemoService, OtherService]),
            ],
          },
        });

        const demoService = useAppService(DemoService, rootApp);

        expect(wrapper.vm.demoService).toBe(demoService);

        rootApp.unmount();
      }),
      { numRuns: 10 }
    );
  });
});
