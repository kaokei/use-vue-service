/**
 * test13 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：服务缺失错误（未注册服务的错误处理）
 * 验证：未注册服务时挂载始终抛出特定错误
 */

import fc from 'fast-check';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';

const arbMsg = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

describe('test13 — 属性基测试', () => {
  /**
   * Property 1：未注册服务时挂载始终抛出错误
   *
   * 对于任意 msg，在未注册 DemoService 的情况下挂载 DemoComp，
   * 始终抛出 "No matching binding found for token: DemoService" 错误。
   */
  it('Property 1 — 未注册服务时挂载始终抛出特定错误', () => {
    fc.assert(
      fc.property(arbMsg, (msg) => {
        expect(() => {
          mount(DemoComp, { props: { msg } });
        }).toThrow('No matching binding found for token: DemoService');
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 2：错误信息包含服务名称
   *
   * 对于任意 msg，抛出的错误信息始终包含 "DemoService" 字符串。
   */
  it('Property 2 — 错误信息始终包含服务名称', () => {
    fc.assert(
      fc.property(arbMsg, (msg) => {
        let errorMessage = '';
        try {
          mount(DemoComp, { props: { msg } });
        } catch (e: any) {
          errorMessage = e.message || '';
        }
        expect(errorMessage).toContain('DemoService');
      }),
      { numRuns: 20 }
    );
  });
});
