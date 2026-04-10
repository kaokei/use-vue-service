/**
 * test16 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：在 app.runWithContext 中使用 useService
 * 验证：app.runWithContext 中获取的服务与全局服务是同一实例，
 *       但与组件级服务是不同实例
 *
 * 注意：declareRootProviders 操作全局容器，只能注册一次，
 * 因此在 beforeAll 中注册，PBT 测试只验证属性。
 */

import fc from 'fast-check';
import { mount } from '@vue/test-utils';
import { declareRootProviders, useService, useRootService } from '@/index';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { App } from 'vue';

// 全局容器只注册一次
beforeAll(() => {
  declareRootProviders([DemoService]);
});

describe('test16 — 属性基测试', () => {
  /**
   * Property 1：app.runWithContext 中获取的服务与全局服务是同一实例
   *
   * 无论挂载多少次，通过 app.runWithContext 获取的服务实例
   * 始终与 useRootService 获取的全局服务实例相同。
   */
  it('Property 1 — app.runWithContext 中获取的服务与全局服务是同一实例', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
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

        wrapper.unmount();
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property 2：组件级服务与全局服务是不同实例
   *
   * 无论挂载多少次，组件内通过 declareProviders 注册的服务实例
   * 始终与全局服务实例不同（容器隔离）。
   */
  it('Property 2 — 组件级服务与全局服务是不同实例', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
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

        // 组件级服务与全局服务不同
        expect(wrapper.vm.service).toBeInstanceOf(DemoService);
        expect(wrapper.vm.service).not.toBe(appDemoService);
        expect(wrapper.vm.service).not.toBe(rootDemoService);

        wrapper.unmount();
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property 3：多次挂载时全局服务始终是同一实例
   *
   * 对于任意次数的挂载，每次通过 app.runWithContext 获取的服务
   * 始终与全局服务是同一实例。
   */
  it('Property 3 — 多次挂载时全局服务始终是同一实例', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 5 }), (mountTimes) => {
        const rootDemoService = useRootService(DemoService);

        for (let i = 0; i < mountTimes; i++) {
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

          expect(appDemoService).toBe(rootDemoService);

          wrapper.unmount();
        }
      }),
      { numRuns: 10 }
    );
  });
});
