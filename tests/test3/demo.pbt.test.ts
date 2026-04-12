/**
 * test3 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：服务间依赖注入（DemoService 依赖 OtherService）
 * 验证：服务实例类型、依赖注入关系、sum 计算的正确性
 */

import fc from 'fast-check';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { OtherService } from './OtherService';

const arbClickTimes = fc.integer({ min: 1, max: 5 });

describe('test3 — 属性基测试', () => {
  /**
   * Property 1：服务实例类型不变性
   *
   * 无论挂载多少次，demoService 和 otherService 始终是对应类的实例，
   * 且 demoService.otherService 与 wrapper.vm.otherService 是同一个实例。
   */
  it('Property 1 — 服务实例类型和依赖注入关系不变', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const wrapper = mount(DemoComp);
        expect(wrapper.vm.demoService).toBeInstanceOf(DemoService);
        expect(wrapper.vm.otherService).toBeInstanceOf(OtherService);
        expect(wrapper.vm.demoService.otherService).toBe(wrapper.vm.otherService);
        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 2：demo-count 点击后 sum 同步递增，other-count 不变
   *
   * 对于任意点击次数 n，每次点击 .btn-demo 后，
   * demo-count 递增 1，sum 也递增 1，other-count 不变。
   */
  it('Property 2 — demo-count 点击后 sum 同步递增，other-count 不变', async () => {
    await fc.assert(
      fc.asyncProperty(arbClickTimes, async (clickTimes) => {
        const wrapper = mount(DemoComp);

        // 初始值：demo-count=100, other-count=200, sum=300
        let expectedDemoCount = 100;
        let expectedSum = 300;
        const initialOtherCount = wrapper.get('.other-count').text();

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-demo').trigger('click');
          expectedDemoCount++;
          expectedSum++;
          expect(wrapper.get('.demo-count').text()).toBe(String(expectedDemoCount));
          expect(wrapper.get('.demo-sum').text()).toBe(String(expectedSum));
          expect(wrapper.get('.other-count').text()).toBe(initialOtherCount);
        }

        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 3：other-count 点击后 sum 同步递增，demo-count 不变
   *
   * 对于任意点击次数 n，每次点击 .btn-other 后，
   * other-count 递增 1，sum 也递增 1，demo-count 不变。
   */
  it('Property 3 — other-count 点击后 sum 同步递增，demo-count 不变', async () => {
    await fc.assert(
      fc.asyncProperty(arbClickTimes, async (clickTimes) => {
        const wrapper = mount(DemoComp);

        let expectedOtherCount = 200;
        let expectedSum = 300;
        const initialDemoCount = wrapper.get('.demo-count').text();

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-other').trigger('click');
          expectedOtherCount++;
          expectedSum++;
          expect(wrapper.get('.other-count').text()).toBe(String(expectedOtherCount));
          expect(wrapper.get('.demo-sum').text()).toBe(String(expectedSum));
          expect(wrapper.get('.demo-count').text()).toBe(initialDemoCount);
        }

        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 4：sum 始终等于 demo-count + other-count
   *
   * 对于任意组合的点击操作，sum 的值始终等于 demo-count + other-count。
   */
  it('Property 4 — sum 始终等于 demo-count + other-count', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 3 }),
        fc.integer({ min: 0, max: 3 }),
        async (demoClicks, otherClicks) => {
          const wrapper = mount(DemoComp);

          for (let i = 0; i < demoClicks; i++) {
            await wrapper.get('.btn-demo').trigger('click');
          }
          for (let i = 0; i < otherClicks; i++) {
            await wrapper.get('.btn-other').trigger('click');
          }

          const demoCount = parseInt(wrapper.get('.demo-count').text());
          const otherCount = parseInt(wrapper.get('.other-count').text());
          const sum = parseInt(wrapper.get('.demo-sum').text());

          expect(sum).toBe(demoCount + otherCount);

          wrapper.unmount();
        }
      ),
      { numRuns: 20 }
    );
  });
});
