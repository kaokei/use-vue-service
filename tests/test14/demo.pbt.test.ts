/**
 * test14 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：容器隔离（组件级与全局级容器的严格区分）
 * 验证：组件级注册的服务无法通过 useRootService 访问
 */

import fc from 'fast-check';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { useRootService } from '@/index';

const arbMsg = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

describe('test14 — 属性基测试', () => {
  /**
   * Property 1：组件级注册的服务无法通过 useRootService 访问
   *
   * 对于任意 msg，组件内通过 declareProviders 注册的服务，
   * 在组件外通过 useRootService 访问始终抛出错误。
   */
  it('Property 1 — 组件级服务无法通过 useRootService 访问', () => {
    fc.assert(
      fc.property(arbMsg, (msg) => {
        const wrapper = mount(DemoComp, { props: { msg } });

        // 组件内可以正常访问
        expect(wrapper.vm.service).toBeInstanceOf(DemoService);

        // 组件外通过 useRootService 访问始终抛出错误
        expect(() => {
          useRootService(DemoService);
        }).toThrow('No matching binding found for token: DemoService');

        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 2：容器隔离的错误信息始终包含服务名称
   *
   * 对于任意 msg，useRootService 抛出的错误信息始终包含 "DemoService"。
   */
  it('Property 2 — 容器隔离错误信息始终包含服务名称', () => {
    fc.assert(
      fc.property(arbMsg, (msg) => {
        mount(DemoComp, { props: { msg } });

        let errorMessage = '';
        try {
          useRootService(DemoService);
        } catch (e: any) {
          errorMessage = e.message || '';
        }
        expect(errorMessage).toContain('DemoService');
      }),
      { numRuns: 20 }
    );
  });
});
