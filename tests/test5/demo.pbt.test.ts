/**
 * test5 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：Token 系统与类型推导，服务间依赖注入
 * 验证：Token 注入的服务实例类型、各计数器独立性、name/computedName 同步
 */

import fc from 'fast-check';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { OtherService } from './OtherService';

const arbMsg = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
const arbClickTimes = fc.integer({ min: 1, max: 5 });

describe('test5 — 属性基测试', () => {
  /**
   * Property 1：服务实例类型和依赖注入关系不变
   *
   * 对于任意 msg，挂载后服务实例类型始终正确，
   * 且 service.otherService 是 OtherService 的实例。
   */
  it('Property 1 — 服务实例类型和依赖注入关系不变', () => {
    fc.assert(
      fc.property(arbMsg, (msg) => {
        const wrapper = mount(DemoComp, { props: { msg } });
        expect(wrapper.vm.service).toBeInstanceOf(DemoService);
        expect(wrapper.vm.service.otherService).toBeInstanceOf(OtherService);
        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 2：count 点击后单调递增，其他属性不受影响
   *
   * 对于任意点击次数 n，每次点击 .btn-count 后 count 递增 1，
   * age、name、computedName、other-count 保持不变。
   */
  it('Property 2 — count 点击后单调递增，其他属性不受影响', async () => {
    await fc.assert(
      fc.asyncProperty(arbMsg, arbClickTimes, async (msg, clickTimes) => {
        const wrapper = mount(DemoComp, { props: { msg } });

        const initialAge = wrapper.get('.age').text();
        const initialName = wrapper.get('.name').text();
        const initialComputedName = wrapper.get('.computedName').text();
        const initialOtherCount = wrapper.get('.other-count').text();
        let expectedCount = 1;

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-count').trigger('click');
          expectedCount++;
          expect(wrapper.get('.count').text()).toBe(String(expectedCount));
          expect(wrapper.get('.age').text()).toBe(initialAge);
          expect(wrapper.get('.name').text()).toBe(initialName);
          expect(wrapper.get('.computedName').text()).toBe(initialComputedName);
          expect(wrapper.get('.other-count').text()).toBe(initialOtherCount);
        }

        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 3：age 点击后 name/computedName 同步更新，其他属性不受影响
   *
   * 对于任意点击次数 n，每次点击 .btn-age 后，
   * name 和 computedName 始终等于 `DemoService-${age}`，
   * count 和 other-count 保持不变。
   */
  it('Property 3 — age 变化后 name/computedName 同步，count/other-count 不受影响', async () => {
    await fc.assert(
      fc.asyncProperty(arbMsg, arbClickTimes, async (msg, clickTimes) => {
        const wrapper = mount(DemoComp, { props: { msg } });

        const initialCount = wrapper.get('.count').text();
        const initialOtherCount = wrapper.get('.other-count').text();
        let expectedAge = 100;

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-age').trigger('click');
          expectedAge++;
          const expectedName = `DemoService-${expectedAge}`;
          expect(wrapper.get('.age').text()).toBe(String(expectedAge));
          expect(wrapper.get('.name').text()).toBe(expectedName);
          expect(wrapper.get('.computedName').text()).toBe(expectedName);
          expect(wrapper.get('.count').text()).toBe(initialCount);
          expect(wrapper.get('.other-count').text()).toBe(initialOtherCount);
        }

        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 4：other-count 点击后递增，其他属性不受影响
   *
   * 对于任意点击次数 n，每次点击 .btn-other-count 后，
   * other-count 递增 10，count、age、name、computedName 保持不变。
   */
  it('Property 4 — other-count 点击后递增，其他属性不受影响', async () => {
    await fc.assert(
      fc.asyncProperty(arbMsg, arbClickTimes, async (msg, clickTimes) => {
        const wrapper = mount(DemoComp, { props: { msg } });

        const initialCount = wrapper.get('.count').text();
        const initialAge = wrapper.get('.age').text();
        const initialName = wrapper.get('.name').text();
        const initialComputedName = wrapper.get('.computedName').text();
        let expectedOtherCount = 100;

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-other-count').trigger('click');
          expectedOtherCount += 10;
          expect(wrapper.get('.other-count').text()).toBe(String(expectedOtherCount));
          expect(wrapper.get('.count').text()).toBe(initialCount);
          expect(wrapper.get('.age').text()).toBe(initialAge);
          expect(wrapper.get('.name').text()).toBe(initialName);
          expect(wrapper.get('.computedName').text()).toBe(initialComputedName);
        }

        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });
});
