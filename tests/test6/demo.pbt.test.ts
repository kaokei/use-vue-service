/**
 * test6 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：容器绑定 API（bind().to() 和 bind().toSelf()）
 * 验证：两种绑定方式的行为一致性
 */

import fc from 'fast-check';
import { mount } from '@vue/test-utils';
import DemoCompTo from './DemoCompTo.vue';
import DemoCompToSelf from './DemoCompToSelf.vue';
import { DemoService } from './DemoService';
import { OtherService } from './OtherService';

const arbMsg = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
const arbClickTimes = fc.integer({ min: 1, max: 5 });

/**
 * 通用属性测试工厂函数，用于验证两种绑定方式的行为一致性
 */
function createBindingTests(
  compName: string,
  CompComponent: any
) {
  describe(`${compName} — 属性基测试`, () => {
    /**
     * Property 1：服务实例类型和依赖注入关系不变
     */
    it('Property 1 — 服务实例类型和依赖注入关系不变', () => {
      fc.assert(
        fc.property(arbMsg, (msg) => {
          const wrapper = mount(CompComponent, { props: { msg } });
          expect(wrapper.vm.service).toBeInstanceOf(DemoService);
          expect(wrapper.vm.service.otherService).toBeInstanceOf(OtherService);
          wrapper.unmount();
        }),
        { numRuns: 20 }
      );
    });

    /**
     * Property 2：count 点击后单调递增，其他属性不受影响
     */
    it('Property 2 — count 点击后单调递增，其他属性不受影响', async () => {
      await fc.assert(
        fc.asyncProperty(arbMsg, arbClickTimes, async (msg, clickTimes) => {
          const wrapper = mount(CompComponent, { props: { msg } });

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
     * Property 3：age 变化后 name/computedName 同步更新
     */
    it('Property 3 — age 变化后 name/computedName 同步更新', async () => {
      await fc.assert(
        fc.asyncProperty(arbMsg, arbClickTimes, async (msg, clickTimes) => {
          const wrapper = mount(CompComponent, { props: { msg } });

          let expectedAge = 100;

          for (let i = 0; i < clickTimes; i++) {
            await wrapper.get('.btn-age').trigger('click');
            expectedAge++;
            const expectedName = `DemoService-${expectedAge}`;
            expect(wrapper.get('.age').text()).toBe(String(expectedAge));
            expect(wrapper.get('.name').text()).toBe(expectedName);
            expect(wrapper.get('.computedName').text()).toBe(expectedName);
          }

          wrapper.unmount();
        }),
        { numRuns: 20 }
      );
    });
  });
}

// 对两种绑定方式分别运行相同的属性测试
createBindingTests('DemoCompTo（bind().to()）', DemoCompTo);
createBindingTests('DemoCompToSelf（bind().toSelf()）', DemoCompToSelf);

describe('test6 — bind().to() 与 bind().toSelf() 行为一致性', () => {
  /**
   * Property 4：两种绑定方式的初始渲染结果一致
   *
   * 对于任意 msg，两种绑定方式挂载后的初始渲染结果应完全一致。
   */
  it('Property 4 — 两种绑定方式初始渲染结果一致', () => {
    fc.assert(
      fc.property(arbMsg, (msg) => {
        const wrapperTo = mount(DemoCompTo, { props: { msg } });
        const wrapperToSelf = mount(DemoCompToSelf, { props: { msg } });

        expect(wrapperTo.get('.count').text()).toBe(wrapperToSelf.get('.count').text());
        expect(wrapperTo.get('.age').text()).toBe(wrapperToSelf.get('.age').text());
        expect(wrapperTo.get('.name').text()).toBe(wrapperToSelf.get('.name').text());
        expect(wrapperTo.get('.computedName').text()).toBe(wrapperToSelf.get('.computedName').text());

        wrapperTo.unmount();
        wrapperToSelf.unmount();
      }),
      { numRuns: 20 }
    );
  });
});
