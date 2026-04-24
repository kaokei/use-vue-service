/**
 * test12 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：API 使用限制（useService 仅在 setup 中可用）
 * 验证：在 setup 外调用 useService 始终抛出错误
 */

import fc from 'fast-check';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { useService } from '@/index';

const arbMsg = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

describe('test12 — 属性基测试', () => {
  /**
   * Property 1：在 setup 外调用 useService 始终抛出错误
   *
   * 对于任意 msg，挂载组件后，在组件外调用 useService 始终抛出
   * "useService 只能在 setup 中使用" 错误。
   */
  it('Property 1 — 在 setup 外调用 useService 始终抛出错误', () => {
    fc.assert(
      fc.property(arbMsg, (msg) => {
        const wrapper = mount(DemoComp, { props: { msg } });

        expect(wrapper.vm.service).toBeInstanceOf(DemoService);

        // 在 setup 外调用 useService 始终抛出错误
        expect(() => {
          useService(DemoService);
        }).toThrow('useService 只能在 setup 中使用');

        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 2：多次在 setup 外调用 useService，每次都抛出相同错误
   *
   * 对于任意调用次数 n，每次在 setup 外调用 useService 都抛出相同的错误。
   */
  it('Property 2 — 多次在 setup 外调用 useService 每次都抛出相同错误', () => {
    fc.assert(
      fc.property(
        arbMsg,
        fc.integer({ min: 1, max: 5 }),
        (msg, callTimes) => {
          const wrapper = mount(DemoComp, { props: { msg } });

          for (let i = 0; i < callTimes; i++) {
            expect(() => {
              useService(DemoService);
            }).toThrow('useService 只能在 setup 中使用');
          }

          wrapper.unmount();
        }
      ),
      { numRuns: 20 }
    );
  });
});
