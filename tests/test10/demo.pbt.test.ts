/**
 * test10 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：全局服务访问（useRootService 与 useService 等效性）
 * 验证：全局服务单例性、组件内外访问一致性、计数器独立性
 *
 * 注意：declareRootProviders 操作全局容器，只能注册一次，
 * 因此在 beforeAll 中注册，PBT 测试只验证属性。
 */

import fc from 'fast-check';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { OtherService } from './OtherService';
import { declareRootProviders, useRootService } from '@/index';

const arbClickTimes = fc.integer({ min: 1, max: 5 });

// 全局容器只注册一次
beforeAll(() => {
  declareRootProviders([DemoService]);
  declareRootProviders([OtherService]);
});

describe('test10 — 属性基测试', () => {
  /**
   * Property 1：useRootService 多次调用返回同一实例（全局单例性）
   *
   * 无论调用多少次 useRootService，返回的始终是同一个实例。
   */
  it('Property 1 — useRootService 多次调用返回同一实例', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 5 }), (callTimes) => {
        const firstDemo = useRootService(DemoService);
        const firstOther = useRootService(OtherService);

        for (let i = 0; i < callTimes; i++) {
          const d = useRootService(DemoService);
          const o = useRootService(OtherService);
          expect(d).toBe(firstDemo);
          expect(o).toBe(firstOther);
        }

        expect(firstDemo).toBeInstanceOf(DemoService);
        expect(firstOther).toBeInstanceOf(OtherService);
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 2：组件内外访问全局服务是同一实例
   *
   * 无论挂载多少次，组件内通过 useService 获取的全局服务实例
   * 与组件外通过 useRootService 获取的实例是同一个。
   */
  it('Property 2 — 组件内外访问全局服务是同一实例', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const wrapper = mount(DemoComp);

        const demoService = useRootService(DemoService);
        const otherService = useRootService(OtherService);

        expect(demoService).toBe(wrapper.vm.demoService1);
        expect(demoService).toBe(wrapper.vm.demoService2);
        expect(demoService).toBe(wrapper.vm.demoService3);
        expect(demoService).toBe(wrapper.vm.demoService4);
        expect(otherService).toBe(wrapper.vm.otherService1);
        expect(otherService).toBe(wrapper.vm.otherService2);
        expect(otherService).toBe(wrapper.vm.otherService3);
        expect(otherService).toBe(wrapper.vm.otherService4);

        wrapper.unmount();
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property 3：全局服务计数器点击后同步更新
   *
   * 对于任意点击次数 n，通过 .btn-demo1 修改全局 demoService.count 后，
   * 所有引用该服务的显示都同步更新。
   */
  it('Property 3 — 全局服务计数器点击后所有引用同步更新', async () => {
    await fc.assert(
      fc.asyncProperty(arbClickTimes, async (clickTimes) => {
        const wrapper = mount(DemoComp);

        const initialCount = parseInt(wrapper.get('.demo1-count').text());

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-demo1').trigger('click');
        }

        const expectedCount = initialCount + clickTimes;
        expect(wrapper.get('.demo1-count').text()).toBe(String(expectedCount));
        expect(wrapper.get('.demo2-count').text()).toBe(String(expectedCount));

        wrapper.unmount();
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property 4：demo 和 other 全局计数器相互独立
   *
   * 对于任意组合的点击操作，demo-count 和 other-count 相互独立。
   */
  it('Property 4 — demo 和 other 全局计数器相互独立', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 3 }),
        fc.integer({ min: 0, max: 3 }),
        async (demoClicks, otherClicks) => {
          const wrapper = mount(DemoComp);

          const initialDemoCount = parseInt(wrapper.get('.demo1-count').text());
          const initialOtherCount = parseInt(wrapper.get('.other1-count').text());

          for (let i = 0; i < demoClicks; i++) {
            await wrapper.get('.btn-demo1').trigger('click');
          }
          for (let i = 0; i < otherClicks; i++) {
            await wrapper.get('.btn-other1').trigger('click');
          }

          expect(wrapper.get('.demo1-count').text()).toBe(String(initialDemoCount + demoClicks));
          expect(wrapper.get('.demo2-count').text()).toBe(String(initialDemoCount + demoClicks));
          expect(wrapper.get('.other1-count').text()).toBe(String(initialOtherCount + otherClicks));
          expect(wrapper.get('.other2-count').text()).toBe(String(initialOtherCount + otherClicks));

          wrapper.unmount();
        }
      ),
      { numRuns: 10 }
    );
  });
});
