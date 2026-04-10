/**
 * test2 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：父组件通过事件与子组件交互，共享同一个服务实例
 * 验证：count 累加、age 变化后 name/computedName 同步、跨组件操作的一致性
 */

import fc from 'fast-check';
import { mount } from '@vue/test-utils';
import ParentDemo from './ParentComp.vue';
import DemoComp from './DemoComp.vue';

const arbClickTimes = fc.integer({ min: 1, max: 5 });

describe('test2 — 属性基测试', () => {
  /**
   * Property 1：count 点击后单调递增，且 name/computedName 不受影响
   *
   * 对于任意点击次数 n，每次点击 .btn-count 后 count 递增 1，
   * 而 age、name、computedName 保持不变。
   */
  it('Property 1 — count 点击后单调递增，age/name/computedName 不受影响', async () => {
    await fc.assert(
      fc.asyncProperty(arbClickTimes, async (clickTimes) => {
        const wrapper = mount(ParentDemo);

        const initialAge = wrapper.get('.age').text();
        const initialName = wrapper.get('.name').text();
        const initialComputedName = wrapper.get('.computedName').text();
        let expectedCount = 1;

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-count').trigger('click');
          expectedCount++;
          expect(wrapper.get('.count').text()).toBe(String(expectedCount));
          expect(wrapper.get('.age').text()).toBe(initialAge);
          expect(wrapper.get('.name').text()).toBe(initialName);
          expect(wrapper.get('.computedName').text()).toBe(initialComputedName);
        }

        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 2：age 点击后 name 和 computedName 同步更新，count 不受影响
   *
   * 对于任意点击次数 n，每次点击 .btn-age 后，
   * name 和 computedName 始终等于 `nihao-DemoService-${age}`，
   * 且 count 保持不变。
   */
  it('Property 2 — age 变化后 name/computedName 同步更新，count 不受影响', async () => {
    await fc.assert(
      fc.asyncProperty(arbClickTimes, async (clickTimes) => {
        const wrapper = mount(ParentDemo);

        const initialCount = wrapper.get('.count').text();
        let expectedAge = 100;

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-age').trigger('click');
          expectedAge++;
          const expectedName = `nihao-DemoService-${expectedAge}`;
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
   * Property 3：子组件 count 事件与父组件操作的一致性
   *
   * 通过子组件按钮触发的 count 事件，其 emitted 数量应与点击次数一致，
   * 且每次 emitted 的值等于当前 count 值。
   */
  it('Property 3 — 子组件 count 事件 emitted 数量与点击次数一致', async () => {
    await fc.assert(
      fc.asyncProperty(arbClickTimes, async (clickTimes) => {
        const wrapper = mount(ParentDemo);
        const demoCompWrapper = wrapper.getComponent(DemoComp);

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-count').trigger('click');
        }

        const countEvent = demoCompWrapper.emitted('count');
        expect(countEvent).toHaveLength(clickTimes);

        // 每次 emitted 的值应等于点击后的 count 值（从 2 开始递增）
        for (let i = 0; i < clickTimes; i++) {
          expect(countEvent && countEvent[i]).toEqual([i + 2]);
        }

        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 4：父组件操作与子组件操作对同一服务的影响一致
   *
   * 通过父组件按钮（.btn-parent-count）和子组件按钮（.btn-count）
   * 操作同一个服务，count 的最终值应等于两者点击次数之和 + 初始值。
   */
  it('Property 4 — 父子组件操作同一服务，count 最终值等于总点击次数 + 初始值', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 3 }),
        fc.integer({ min: 1, max: 3 }),
        async (childClicks, parentClicks) => {
          const wrapper = mount(ParentDemo);

          for (let i = 0; i < childClicks; i++) {
            await wrapper.get('.btn-count').trigger('click');
          }
          for (let i = 0; i < parentClicks; i++) {
            await wrapper.get('.btn-parent-count').trigger('click');
          }

          const expectedCount = 1 + childClicks + parentClicks;
          expect(wrapper.get('.count').text()).toBe(String(expectedCount));

          wrapper.unmount();
        }
      ),
      { numRuns: 20 }
    );
  });
});
