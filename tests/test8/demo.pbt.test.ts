/**
 * test8 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：服务单例性（同一组件内多次 useService 返回同一实例）
 * 验证：多次获取同一服务返回同一实例，状态共享
 */

import fc from 'fast-check';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { OtherService } from './OtherService';

const arbClickTimes = fc.integer({ min: 1, max: 5 });

describe('test8 — 属性基测试', () => {
  /**
   * Property 1：多次 useService 返回同一实例（单例性）
   *
   * 无论挂载多少次，同一组件内多次获取同一服务始终返回同一实例。
   */
  it('Property 1 — 多次 useService 返回同一实例', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const wrapper = mount(DemoComp);
        expect(wrapper.vm.demoService1).toBeInstanceOf(DemoService);
        expect(wrapper.vm.demoService2).toBeInstanceOf(DemoService);
        expect(wrapper.vm.otherService1).toBeInstanceOf(OtherService);
        expect(wrapper.vm.otherService2).toBeInstanceOf(OtherService);
        // 单例性：同一服务的多次获取返回同一实例
        expect(wrapper.vm.demoService1).toBe(wrapper.vm.demoService2);
        expect(wrapper.vm.otherService1).toBe(wrapper.vm.otherService2);
        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 2：通过 demo1 按钮修改 count，demo1 和 demo2 同步更新
   *
   * 对于任意点击次数 n，通过 .btn-demo1 修改 demoService.count 后，
   * demo1-count 和 demo2-count 应同步更新（因为是同一实例）。
   */
  it('Property 2 — 通过 demo1 按钮修改后 demo1/demo2 同步更新', async () => {
    await fc.assert(
      fc.asyncProperty(arbClickTimes, async (clickTimes) => {
        const wrapper = mount(DemoComp);

        let expectedCount = 100;

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-demo1').trigger('click');
          expectedCount++;
          expect(wrapper.get('.demo1-count').text()).toBe(String(expectedCount));
          expect(wrapper.get('.demo2-count').text()).toBe(String(expectedCount));
        }

        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 3：通过 demo2 按钮修改 count，demo1 和 demo2 同步更新
   *
   * 对于任意点击次数 n，通过 .btn-demo2 修改 demoService.count 后，
   * demo1-count 和 demo2-count 应同步更新（因为是同一实例）。
   */
  it('Property 3 — 通过 demo2 按钮修改后 demo1/demo2 同步更新', async () => {
    await fc.assert(
      fc.asyncProperty(arbClickTimes, async (clickTimes) => {
        const wrapper = mount(DemoComp);

        let expectedCount = 100;

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-demo2').trigger('click');
          expectedCount++;
          expect(wrapper.get('.demo1-count').text()).toBe(String(expectedCount));
          expect(wrapper.get('.demo2-count').text()).toBe(String(expectedCount));
        }

        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 4：demo 和 other 计数器相互独立
   *
   * 对于任意组合的点击操作，demo-count 和 other-count 相互独立，
   * 修改一个不影响另一个。
   */
  it('Property 4 — demo 和 other 计数器相互独立', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 3 }),
        fc.integer({ min: 0, max: 3 }),
        async (demoClicks, otherClicks) => {
          const wrapper = mount(DemoComp);

          for (let i = 0; i < demoClicks; i++) {
            await wrapper.get('.btn-demo1').trigger('click');
          }
          for (let i = 0; i < otherClicks; i++) {
            await wrapper.get('.btn-other1').trigger('click');
          }

          expect(wrapper.get('.demo1-count').text()).toBe(String(100 + demoClicks));
          expect(wrapper.get('.demo2-count').text()).toBe(String(100 + demoClicks));
          expect(wrapper.get('.other1-count').text()).toBe(String(200 + otherClicks));
          expect(wrapper.get('.other2-count').text()).toBe(String(200 + otherClicks));

          wrapper.unmount();
        }
      ),
      { numRuns: 20 }
    );
  });
});
