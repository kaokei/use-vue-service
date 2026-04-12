/**
 * test22 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：多重继承与依赖注入
 * 验证：继承链中各层级计数器的独立性、name/computedName 同步
 */

import fc from 'fast-check';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';

const arbMsg = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
const arbClickTimes = fc.integer({ min: 1, max: 5 });

describe('test22 — 属性基测试', () => {
  /**
   * Property 1：服务实例类型不变性
   *
   * 对于任意 msg，挂载后服务实例始终是 DemoService 的实例。
   */
  it('Property 1 — 服务实例始终是 DemoService 的实例', () => {
    fc.assert(
      fc.property(arbMsg, (msg) => {
        const wrapper = mount(DemoComp, { props: { msg } });
        expect(wrapper.vm.service).toBeInstanceOf(DemoService);
        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 2：count 点击后单调递增，继承链中其他计数器不受影响
   *
   * 对于任意点击次数 n，每次点击 .btn-count 后，
   * count 递增 1，count-parent、count-grand、count-base、count-other 保持不变。
   */
  it('Property 2 — count 点击后单调递增，继承链中其他计数器不受影响', async () => {
    await fc.assert(
      fc.asyncProperty(arbMsg, arbClickTimes, async (msg, clickTimes) => {
        const wrapper = mount(DemoComp, { props: { msg } });

        const initialCountParent = wrapper.get('.count-parent').text();
        const initialCountGrand = wrapper.get('.count-grand').text();
        const initialCountBase = wrapper.get('.count-base').text();
        const initialCountOther = wrapper.get('.count-other').text();
        let expectedCount = 1;

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-count').trigger('click');
          expectedCount++;
          expect(wrapper.get('.count').text()).toBe(String(expectedCount));
          expect(wrapper.get('.count-parent').text()).toBe(initialCountParent);
          expect(wrapper.get('.count-grand').text()).toBe(initialCountGrand);
          expect(wrapper.get('.count-base').text()).toBe(initialCountBase);
          expect(wrapper.get('.count-other').text()).toBe(initialCountOther);
        }

        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 3：age 变化后 name/computedName 同步更新，count 不受影响
   *
   * 对于任意点击次数 n，每次点击 .btn-age 后，
   * name 和 computedName 始终等于 `DemoService-${age}`，
   * count 保持不变。
   */
  it('Property 3 — age 变化后 name/computedName 同步更新', async () => {
    await fc.assert(
      fc.asyncProperty(arbMsg, arbClickTimes, async (msg, clickTimes) => {
        const wrapper = mount(DemoComp, { props: { msg } });

        const initialCount = wrapper.get('.count').text();
        let expectedAge = 100;

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-age').trigger('click');
          expectedAge++;
          const expectedName = `DemoService-${expectedAge}`;
          expect(wrapper.get('.age').text()).toBe(String(expectedAge));
          expect(wrapper.get('.name').text()).toBe(expectedName);
          expect(wrapper.get('.computedName').text()).toBe(expectedName);
          expect(wrapper.get('.count').text()).toBe(initialCount);
        }

        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 4：count-other 点击后递增，其他计数器不受影响
   *
   * 对于任意点击次数 n，每次点击 .btn-count-other 后，
   * count-other 递增 1，其他计数器保持不变。
   */
  it('Property 4 — count-other 点击后递增，其他计数器不受影响', async () => {
    await fc.assert(
      fc.asyncProperty(arbMsg, arbClickTimes, async (msg, clickTimes) => {
        const wrapper = mount(DemoComp, { props: { msg } });

        const initialCount = wrapper.get('.count').text();
        const initialCountParent = wrapper.get('.count-parent').text();
        const initialCountGrand = wrapper.get('.count-grand').text();
        const initialCountBase = wrapper.get('.count-base').text();
        let expectedCountOther = 1;

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-count-other').trigger('click');
          expectedCountOther++;
          expect(wrapper.get('.count-other').text()).toBe(String(expectedCountOther));
          expect(wrapper.get('.count').text()).toBe(initialCount);
          expect(wrapper.get('.count-parent').text()).toBe(initialCountParent);
          expect(wrapper.get('.count-grand').text()).toBe(initialCountGrand);
          expect(wrapper.get('.count-base').text()).toBe(initialCountBase);
        }

        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });
});
