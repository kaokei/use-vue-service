/**
 * test7 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：多层级服务容器（组件级/应用级/全局级）
 * 验证：三层容器的独立性、各层级计数器的独立更新
 *
 * 注意：declareRootProviders 操作全局容器，只能注册一次，
 * 因此在 beforeAll 中注册，PBT 测试只验证属性。
 */

import fc from 'fast-check';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { AppService } from './AppService';
import { RootService } from './RootService';
import {
  declareAppProvidersPlugin,
  declareRootProviders,
  useRootService,
} from '@/index';

const arbMsg = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
const arbClickTimes = fc.integer({ min: 1, max: 3 });

// 全局容器只注册一次
beforeAll(() => {
  declareRootProviders([RootService]);
});

describe('test7 — 属性基测试', () => {
  /**
   * Property 1：三层服务实例类型不变性
   *
   * 对于任意 msg，挂载后三层服务实例类型始终正确。
   */
  it('Property 1 — 三层服务实例类型始终正确', () => {
    fc.assert(
      fc.property(arbMsg, (msg) => {
        const wrapper = mount(DemoComp, {
          props: { msg },
          global: {
            plugins: [declareAppProvidersPlugin([AppService])],
          },
        });

        expect(wrapper.vm.service).toBeInstanceOf(DemoService);
        expect(wrapper.vm.appService).toBeInstanceOf(AppService);
        expect(wrapper.vm.rootService).toBeInstanceOf(RootService);

        wrapper.unmount();
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property 2：全局级服务实例与 useRootService 获取的实例一致
   *
   * 对于任意 msg，组件内访问的 rootService 与 useRootService() 获取的是同一实例。
   */
  it('Property 2 — 全局级服务实例与 useRootService 获取的实例一致', () => {
    fc.assert(
      fc.property(arbMsg, (msg) => {
        const wrapper = mount(DemoComp, {
          props: { msg },
          global: {
            plugins: [declareAppProvidersPlugin([AppService])],
          },
        });

        const rootService = useRootService(RootService);
        expect(wrapper.vm.rootService).toBe(rootService);

        wrapper.unmount();
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property 3：demo-count 点击后只影响组件级计数，app/root 计数不变
   *
   * 对于任意点击次数 n，点击 .btn-demo-count 后，
   * demo-count 递增，app-count 和 root-count 保持不变。
   */
  it('Property 3 — demo-count 点击只影响组件级计数', async () => {
    await fc.assert(
      fc.asyncProperty(arbMsg, arbClickTimes, async (msg, clickTimes) => {
        const wrapper = mount(DemoComp, {
          props: { msg },
          global: {
            plugins: [declareAppProvidersPlugin([AppService])],
          },
        });

        const initialAppCount = wrapper.get('.app-count').text();
        const initialRootCount = wrapper.get('.root-count').text();
        const initialDemoCount = parseInt(wrapper.get('.demo-count').text());

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-demo-count').trigger('click');
        }

        const finalDemoCount = parseInt(wrapper.get('.demo-count').text());
        expect(finalDemoCount).toBe(initialDemoCount + clickTimes * 10);
        expect(wrapper.get('.app-count').text()).toBe(initialAppCount);
        expect(wrapper.get('.root-count').text()).toBe(initialRootCount);

        wrapper.unmount();
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property 4：三层计数器相互独立
   *
   * 对于任意组合的点击操作，三层计数器的值相互独立，
   * 各自只受自己的按钮影响。
   */
  it('Property 4 — 三层计数器相互独立', async () => {
    await fc.assert(
      fc.asyncProperty(
        arbMsg,
        fc.integer({ min: 0, max: 2 }),
        fc.integer({ min: 0, max: 2 }),
        fc.integer({ min: 0, max: 2 }),
        async (msg, demoClicks, appClicks, rootClicks) => {
          const wrapper = mount(DemoComp, {
            props: { msg },
            global: {
              plugins: [declareAppProvidersPlugin([AppService])],
            },
          });

          const initialDemoCount = parseInt(wrapper.get('.demo-count').text());
          const initialAppCount = parseInt(wrapper.get('.app-count').text());
          const initialRootCount = parseInt(wrapper.get('.root-count').text());

          for (let i = 0; i < demoClicks; i++) {
            await wrapper.get('.btn-demo-count').trigger('click');
          }
          for (let i = 0; i < appClicks; i++) {
            await wrapper.get('.btn-app-count').trigger('click');
          }
          for (let i = 0; i < rootClicks; i++) {
            await wrapper.get('.btn-root-count').trigger('click');
          }

          expect(wrapper.get('.demo-count').text()).toBe(String(initialDemoCount + demoClicks * 10));
          expect(wrapper.get('.app-count').text()).toBe(String(initialAppCount + appClicks * 100));
          expect(wrapper.get('.root-count').text()).toBe(String(initialRootCount + rootClicks * 1000));

          wrapper.unmount();
        }
      ),
      { numRuns: 10 }
    );
  });
});
