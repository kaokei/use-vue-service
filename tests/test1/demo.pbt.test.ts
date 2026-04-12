/**
 * test1 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：当前组件访问当前组件的服务
 * 使用 fast-check 验证服务注入、响应式属性更新、getter 和 computed 的通用属性。
 */

import fc from 'fast-check';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';

// ============================================================================
// 公共 arbitrary
// ============================================================================

/** 生成合法的初始 count 值（正整数） */
const arbCount = fc.integer({ min: 1, max: 100 });

/** 生成合法的初始 age 值 */
const arbAge = fc.integer({ min: 0, max: 200 });

/** 生成点击次数（1~5 次） */
const arbClickTimes = fc.integer({ min: 1, max: 5 });

/** 生成随机消息字符串（至少 1 个可见字符，且首尾不含空白，避免 .text() trim 导致比较失败） */
const arbMsg = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s === s.trim() && s.length > 0);

// ============================================================================
// 属性测试
// ============================================================================

describe('test1 — 属性基测试', () => {
  /**
   * Property 1：服务实例类型不变性
   *
   * 对于任意 msg 字符串，挂载 DemoComp 后，
   * wrapper.vm.service 始终是 DemoService 的实例。
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
   * Property 2：msg prop 渲染不变性
   *
   * 对于任意 msg 字符串，挂载后 .msg 元素的文本内容始终等于传入的 msg。
   */
  it('Property 2 — msg prop 渲染与传入值一致', () => {
    fc.assert(
      fc.property(arbMsg, (msg) => {
        const wrapper = mount(DemoComp, { props: { msg } });
        expect(wrapper.get('.msg').text()).toBe(msg);
        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 3：count 点击累加单调递增性
   *
   * 对于任意点击次数 n（1~5），每次点击 .btn-count 后，
   * .count 的值应比上一次多 1，且最终值等于初始值 + n。
   */
  it('Property 3 — count 每次点击后单调递增 1', async () => {
    await fc.assert(
      fc.asyncProperty(arbMsg, arbClickTimes, async (msg, clickTimes) => {
        const wrapper = mount(DemoComp, { props: { msg } });

        // 初始 count 为 1（由 DemoService 初始化）
        let expectedCount = 1;
        expect(wrapper.get('.count').text()).toBe(String(expectedCount));

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-count').trigger('click');
          expectedCount++;
          expect(wrapper.get('.count').text()).toBe(String(expectedCount));
        }

        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 4：age 点击后 name 和 computedName 同步更新
   *
   * 对于任意点击次数 n，每次点击 .btn-age 后，
   * .name 和 .computedName 的文本内容应始终等于 `DemoService-${age}`，
   * 且两者始终保持一致。
   */
  it('Property 4 — age 变化后 name 与 computedName 始终同步', async () => {
    await fc.assert(
      fc.asyncProperty(arbMsg, arbClickTimes, async (msg, clickTimes) => {
        const wrapper = mount(DemoComp, { props: { msg } });

        // 初始 age 为 100
        let expectedAge = 100;

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-age').trigger('click');
          expectedAge++;
          const expectedName = `DemoService-${expectedAge}`;
          expect(wrapper.get('.name').text()).toBe(expectedName);
          expect(wrapper.get('.computedName').text()).toBe(expectedName);
        }

        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 5：count 变化不影响 age、name、computedName
   *
   * 对于任意点击次数 n，点击 .btn-count 后，
   * .age、.name、.computedName 的值应保持不变。
   */
  it('Property 5 — count 变化不影响 age/name/computedName', async () => {
    await fc.assert(
      fc.asyncProperty(arbMsg, arbClickTimes, async (msg, clickTimes) => {
        const wrapper = mount(DemoComp, { props: { msg } });

        const initialAge = wrapper.get('.age').text();
        const initialName = wrapper.get('.name').text();
        const initialComputedName = wrapper.get('.computedName').text();

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-count').trigger('click');
        }

        // age、name、computedName 不受 count 变化影响
        expect(wrapper.get('.age').text()).toBe(initialAge);
        expect(wrapper.get('.name').text()).toBe(initialName);
        expect(wrapper.get('.computedName').text()).toBe(initialComputedName);

        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 6：age 变化不影响 count
   *
   * 对于任意点击次数 n，点击 .btn-age 后，
   * .count 的值应保持不变。
   */
  it('Property 6 — age 变化不影响 count', async () => {
    await fc.assert(
      fc.asyncProperty(arbMsg, arbClickTimes, async (msg, clickTimes) => {
        const wrapper = mount(DemoComp, { props: { msg } });

        const initialCount = wrapper.get('.count').text();

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-age').trigger('click');
        }

        expect(wrapper.get('.count').text()).toBe(initialCount);

        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });
});
