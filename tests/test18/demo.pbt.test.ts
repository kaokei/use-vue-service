/**
 * test18 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：LazyToken 循环依赖解决方案
 * 验证：使用 LazyToken 的循环依赖场景始终不抛出错误
 */

import fc from 'fast-check';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';

describe('test18 — 属性基测试', () => {
  /**
   * Property 1：LazyToken 循环依赖场景始终不抛出错误
   *
   * 对于任意次数的挂载，使用 LazyToken 解决循环依赖的组件
   * 始终能正常挂载，不抛出任何错误。
   */
  it('Property 1 — LazyToken 循环依赖场景始终不抛出错误', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        expect(() => {
          const wrapper = mount(DemoComp);
          wrapper.unmount();
        }).not.toThrowError();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 2：多次挂载和卸载循环依赖组件始终稳定
   *
   * 对于任意次数（1~5）的挂载和卸载操作，
   * 每次都能正常完成，不抛出任何错误。
   */
  it('Property 2 — 多次挂载和卸载循环依赖组件始终稳定', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 5 }), (mountTimes) => {
        for (let i = 0; i < mountTimes; i++) {
          expect(() => {
            const wrapper = mount(DemoComp);
            wrapper.unmount();
          }).not.toThrowError();
        }
      }),
      { numRuns: 20 }
    );
  });
});
