/**
 * test11 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：Vue Router 集成（router/route 作为全局服务注入）
 * 验证：路由实例单例性、路由跳转后 fullpath 同步更新、count 与路由状态相互独立
 *
 * 注意：declareRootProviders 操作全局容器，只能注册一次，
 * 因此在 beforeAll 中注册，PBT 测试只验证属性。
 */

import fc from 'fast-check';
import { flushPromises, mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { router, TYPES } from './router';
import { declareRootProviders, useRootService } from '@/index';
import { markRaw, App } from 'vue';
import { useRoute } from 'vue-router';

const arbMsg = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
const arbClickTimes = fc.integer({ min: 1, max: 5 });

// 全局容器只注册一次，router 和 route 作为全局服务
beforeAll(async () => {
  declareRootProviders(container => {
    container
      .bind(TYPES.router)
      .toConstantValue(router)
      .onActivation((_: any, instance: any) => markRaw(instance));
  });

  router.push('/');
  await router.isReady();
});

/**
 * 创建挂载好的组件 wrapper（含 router 和 route 注册）
 */
async function mountDemoComp(msg: string) {
  router.push('/');
  await router.isReady();

  return mount(DemoComp, {
    props: { msg },
    global: {
      plugins: [
        router,
        (app: App) => {
          app.runWithContext(() => {
            const route = useRoute();
            // route 可能已注册，忽略重复注册错误
            try {
              declareRootProviders(container => {
                container
                  .bind(TYPES.route)
                  .toConstantValue(route)
                  .onActivation((_: any, instance: any) => markRaw(instance));
              });
            } catch {
              // 已注册，忽略
            }
          });
        },
      ],
    },
  });
}

describe('test11 — 属性基测试', () => {
  /**
   * Property 1：服务实例类型不变性
   *
   * 对于任意 msg，挂载后 DemoService 实例类型始终正确，
   * 且注入的 router 始终是全局 router 实例。
   */
  it('Property 1 — 服务实例类型正确，router 始终是全局实例', async () => {
    await fc.assert(
      fc.asyncProperty(arbMsg, async (msg) => {
        const wrapper = await mountDemoComp(msg);

        expect(wrapper.vm.service).toBeInstanceOf(DemoService);
        expect(wrapper.vm.router).toBe(router);
        expect(wrapper.vm.rootRouter).toBe(router);
        expect(wrapper.vm.service.router).toBe(router);

        wrapper.unmount();
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property 2：useRootService 获取的 router/route 与组件内一致
   *
   * 对于任意 msg，通过 useRootService 获取的 router 和 route 实例
   * 始终与组件内访问的实例相同（全局单例）。
   */
  it('Property 2 — useRootService 获取的 router/route 与组件内一致', async () => {
    await fc.assert(
      fc.asyncProperty(arbMsg, async (msg) => {
        const wrapper = await mountDemoComp(msg);

        const rootRouter = useRootService(TYPES.router);
        const rootRoute = useRootService(TYPES.route);

        expect(rootRouter).toBe(router);
        expect(rootRouter).toBe(wrapper.vm.rootRouter);
        expect(rootRoute).toBe(wrapper.vm.rootRoute);
        expect(rootRoute).toBe(wrapper.vm.service.route);
        expect(rootRouter).toBe(wrapper.vm.service.router);

        wrapper.unmount();
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property 3：count 点击后单调递增，路由 fullpath 不受影响
   *
   * 对于任意点击次数 n，每次点击 .btn-count 后，
   * count 递增 1，所有 fullpath 保持不变。
   */
  it('Property 3 — count 点击后单调递增，路由 fullpath 不受影响', async () => {
    await fc.assert(
      fc.asyncProperty(arbMsg, arbClickTimes, async (msg, clickTimes) => {
        const wrapper = await mountDemoComp(msg);

        const initialFullpath = wrapper.get('.fullpath1').text();
        let expectedCount = 1;

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-count').trigger('click');
          expectedCount++;
          expect(wrapper.get('.count').text()).toBe(String(expectedCount));
          // 路由 fullpath 不受 count 变化影响
          expect(wrapper.get('.fullpath1').text()).toBe(initialFullpath);
          expect(wrapper.get('.fullpath2').text()).toBe(initialFullpath);
          expect(wrapper.get('.fullpath3').text()).toBe(initialFullpath);
          expect(wrapper.get('.fullpath4').text()).toBe(initialFullpath);
        }

        wrapper.unmount();
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property 4：路由跳转后所有 fullpath 同步更新，count 不受影响
   *
   * 路由从 '/' 跳转到 '/about' 后，所有 fullpath 显示同步更新为 '/about'，
   * count 保持不变；再跳回 '/' 后，所有 fullpath 恢复为 '/'。
   */
  it('Property 4 — 路由跳转后所有 fullpath 同步更新，count 不受影响', async () => {
    await fc.assert(
      fc.asyncProperty(arbMsg, async (msg) => {
        const wrapper = await mountDemoComp(msg);

        const initialCount = wrapper.get('.count').text();

        // 初始在 '/'
        expect(wrapper.get('.fullpath1').text()).toBe('/');
        expect(wrapper.get('.fullpath2').text()).toBe('/');
        expect(wrapper.get('.fullpath3').text()).toBe('/');
        expect(wrapper.get('.fullpath4').text()).toBe('/');

        // 跳转到 '/about'
        await wrapper.get('.route-about').trigger('click');
        await flushPromises();

        expect(wrapper.get('.fullpath1').text()).toBe('/about');
        expect(wrapper.get('.fullpath2').text()).toBe('/about');
        expect(wrapper.get('.fullpath3').text()).toBe('/about');
        expect(wrapper.get('.fullpath4').text()).toBe('/about');
        expect(wrapper.get('.count').text()).toBe(initialCount);

        // 跳回 '/'
        await wrapper.get('.route-home').trigger('click');
        await flushPromises();

        expect(wrapper.get('.fullpath1').text()).toBe('/');
        expect(wrapper.get('.fullpath2').text()).toBe('/');
        expect(wrapper.get('.fullpath3').text()).toBe('/');
        expect(wrapper.get('.fullpath4').text()).toBe('/');
        expect(wrapper.get('.count').text()).toBe(initialCount);

        wrapper.unmount();
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property 5：count 累加与路由跳转组合操作的独立性
   *
   * 对于任意点击次数 n，先点击 n 次 count，再跳转路由，
   * count 的最终值等于初始值 + n，路由 fullpath 正确更新。
   */
  it('Property 5 — count 累加与路由跳转相互独立', async () => {
    await fc.assert(
      fc.asyncProperty(arbMsg, arbClickTimes, async (msg, clickTimes) => {
        const wrapper = await mountDemoComp(msg);

        // 先点击 n 次 count
        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-count').trigger('click');
        }

        expect(wrapper.get('.count').text()).toBe(String(1 + clickTimes));

        // 再跳转路由
        await wrapper.get('.route-about').trigger('click');
        await flushPromises();

        // count 不受路由跳转影响
        expect(wrapper.get('.count').text()).toBe(String(1 + clickTimes));
        // fullpath 正确更新
        expect(wrapper.get('.fullpath1').text()).toBe('/about');

        wrapper.unmount();
      }),
      { numRuns: 10 }
    );
  });
});
