/**
 * test21 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：EffectScope 生命周期与组件卸载集成
 * 验证：EffectScope 在组件挂载时激活，卸载时停止
 */

import fc from 'fast-check';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { getEffectScope } from '@/scope';
import { onScopeDispose } from 'vue';

const arbClickTimes = fc.integer({ min: 1, max: 5 });

describe('test21 — 属性基测试', () => {
  /**
   * Property 1：组件挂载后 EffectScope 始终处于激活状态
   *
   * 无论挂载多少次，组件挂载后服务的 EffectScope 始终处于激活状态。
   */
  it('Property 1 — 组件挂载后 EffectScope 始终处于激活状态', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const wrapper = mount(DemoComp);
        const demoService = wrapper.vm.demoService;
        const scope = getEffectScope(demoService);

        expect(scope.active).toBe(true);

        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 2：组件卸载后 EffectScope 始终停止
   *
   * 无论挂载多少次，组件卸载后服务的 EffectScope 始终停止（active 为 false）。
   */
  it('Property 2 — 组件卸载后 EffectScope 始终停止', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const wrapper = mount(DemoComp);
        const demoService = wrapper.vm.demoService;
        const scope = getEffectScope(demoService);

        expect(scope.active).toBe(true);

        wrapper.unmount();

        expect(scope.active).toBe(false);
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 3：onScopeDispose 回调在组件卸载时被调用一次
   *
   * 无论挂载多少次，注册在 EffectScope 中的 onScopeDispose 回调
   * 在组件卸载时始终被调用恰好一次。
   */
  it('Property 3 — onScopeDispose 回调在组件卸载时被调用一次', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const wrapper = mount(DemoComp);
        const demoService = wrapper.vm.demoService;
        const scope = getEffectScope(demoService);
        const onScopeDisposeFn = vi.fn();

        scope.run(() => {
          onScopeDispose(onScopeDisposeFn);
        });

        expect(onScopeDisposeFn).not.toHaveBeenCalled();

        wrapper.unmount();

        expect(onScopeDisposeFn).toHaveBeenCalledOnce();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 4：count 点击后 sum 同步更新（@Computed 响应式）
   *
   * 对于任意点击次数 n，每次点击 .btn-count-demo 后，
   * demo-count 递增 1，demo-sum 也相应更新（sum = count + 100）。
   */
  it('Property 4 — count 点击后 sum 同步更新', async () => {
    await fc.assert(
      fc.asyncProperty(arbClickTimes, async (clickTimes) => {
        const wrapper = mount(DemoComp);

        let expectedCount = 1;

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-count-demo').trigger('click');
          expectedCount++;
          expect(wrapper.get('.demo-count').text()).toBe(String(expectedCount));
          expect(wrapper.get('.demo-sum').text()).toBe(String(expectedCount + 100));
        }

        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });
});
