/**
 * test4 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：多层级组件服务共享（DemoComp > ParentComp > ChildComp）
 * 验证：服务单例性、跨层级共享、各层级独立计数
 */

import fc from 'fast-check';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import ParentComp from './ParentComp.vue';
import ChildComp from './ChildComp.vue';
import { DemoService } from './DemoService';
import { ParentService } from './ParentService';
import { ChildService } from './ChildService';

const arbClickTimes = fc.integer({ min: 1, max: 3 });

describe('test4 — 属性基测试', () => {
  /**
   * Property 1：服务实例类型和单例性不变
   *
   * 无论挂载多少次，各层级服务实例类型正确，
   * 且跨层级共享的服务是同一个实例（单例）。
   */
  it('Property 1 — 服务实例类型正确且跨层级共享为单例', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const wrapper = mount(DemoComp);
        const parentWrapper = wrapper.getComponent(ParentComp);
        const childWrapper = parentWrapper.getComponent(ChildComp);

        expect(wrapper.vm.demoService).toBeInstanceOf(DemoService);
        expect(parentWrapper.vm.parentService).toBeInstanceOf(ParentService);
        expect(childWrapper.vm.childService).toBeInstanceOf(ChildService);

        // 跨层级共享同一个 demoService 实例
        expect(parentWrapper.vm.demoService).toBe(wrapper.vm.demoService);
        expect(childWrapper.vm.demoService).toBe(wrapper.vm.demoService);
        // 跨层级共享同一个 parentService 实例
        expect(childWrapper.vm.parentService).toBe(parentWrapper.vm.parentService);

        wrapper.unmount();
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property 2：修改 demoService.count 后，所有层级的 demo-count 同步更新
   *
   * 对于任意点击次数 n，通过任意层级的按钮修改 demoService.count 后，
   * 所有层级显示的 demo-count 值应同步更新（单例共享）。
   */
  it('Property 2 — 修改 demoService.count 后所有层级同步更新', async () => {
    await fc.assert(
      fc.asyncProperty(arbClickTimes, async (clickTimes) => {
        const wrapper = mount(DemoComp);

        let expectedDemoCount = 100;

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-demo').trigger('click');
          expectedDemoCount++;
          // 所有层级的 demo-count 应同步
          expect(wrapper.get('.demo-count').text()).toBe(String(expectedDemoCount));
          expect(wrapper.get('.parent-demo-count').text()).toBe(String(expectedDemoCount));
          expect(wrapper.get('.child-demo-count').text()).toBe(String(expectedDemoCount));
        }

        wrapper.unmount();
      }),
      { numRuns: 15 }
    );
  });

  /**
   * Property 3：修改 parentService.count 后，parent 和 child 层级同步，demo 层级不变
   *
   * 对于任意点击次数 n，通过 .btn-parent 修改 parentService.count 后，
   * parent-count 和 child-parent-count 同步更新，demo-count 不变。
   */
  it('Property 3 — 修改 parentService.count 后 parent/child 层级同步，demo 层级不变', async () => {
    await fc.assert(
      fc.asyncProperty(arbClickTimes, async (clickTimes) => {
        const wrapper = mount(DemoComp);

        const initialDemoCount = wrapper.get('.demo-count').text();
        let expectedParentCount = 200;

        for (let i = 0; i < clickTimes; i++) {
          await wrapper.get('.btn-parent').trigger('click');
          expectedParentCount += 10;
          expect(wrapper.get('.parent-count').text()).toBe(String(expectedParentCount));
          expect(wrapper.get('.child-parent-count').text()).toBe(String(expectedParentCount));
          expect(wrapper.get('.demo-count').text()).toBe(initialDemoCount);
        }

        wrapper.unmount();
      }),
      { numRuns: 15 }
    );
  });

  /**
   * Property 4：各层级服务的 count 相互独立
   *
   * 对于任意组合的点击操作，各层级服务的 count 值相互独立，
   * 修改某层级的 count 不影响其他层级的 count。
   */
  it('Property 4 — 各层级服务 count 相互独立', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 2 }),
        fc.integer({ min: 0, max: 2 }),
        fc.integer({ min: 0, max: 2 }),
        async (demoClicks, parentClicks, childClicks) => {
          const wrapper = mount(DemoComp);

          for (let i = 0; i < demoClicks; i++) {
            await wrapper.get('.btn-demo').trigger('click');
          }
          for (let i = 0; i < parentClicks; i++) {
            await wrapper.get('.btn-parent').trigger('click');
          }
          for (let i = 0; i < childClicks; i++) {
            await wrapper.get('.btn-child').trigger('click');
          }

          // demo-count 只受 demoClicks 影响
          expect(wrapper.get('.demo-count').text()).toBe(String(100 + demoClicks));
          // parent-count 只受 parentClicks 影响（每次 +10）
          expect(wrapper.get('.parent-count').text()).toBe(String(200 + parentClicks * 10));
          // child-count 只受 childClicks 影响（每次 +100）
          expect(wrapper.get('.child-count').text()).toBe(String(300 + childClicks * 100));

          wrapper.unmount();
        }
      ),
      { numRuns: 15 }
    );
  });
});
