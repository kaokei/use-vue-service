/**
 * test9 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：应用级插件注册（declareAppProvidersPlugin 多插件支持）
 * 验证：多个插件注册的服务单例性、计数器独立性
 */

import fc from 'fast-check';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { OtherService } from './OtherService';
import { declareAppProvidersPlugin } from '@/index';

const arbClickTimes = fc.integer({ min: 1, max: 5 });

describe('test9 — 属性基测试', () => {
  /**
   * Property 1：多插件注册的服务实例类型和单例性不变
   *
   * 无论挂载多少次，通过多个 declareAppProvidersPlugin 注册的服务
   * 始终是对应类的实例，且多次获取返回同一实例。
   */
  it('Property 1 — 多插件注册的服务实例类型和单例性不变', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const wrapper = mount(DemoComp, {
          global: {
            plugins: [
              declareAppProvidersPlugin([DemoService]),
              declareAppProvidersPlugin([OtherService]),
            ],
          },
        });

        expect(wrapper.vm.demoService1).toBeInstanceOf(DemoService);
        expect(wrapper.vm.demoService2).toBeInstanceOf(DemoService);
        expect(wrapper.vm.otherService1).toBeInstanceOf(OtherService);
        expect(wrapper.vm.otherService2).toBeInstanceOf(OtherService);
        // 单例性
        expect(wrapper.vm.demoService1).toBe(wrapper.vm.demoService2);
        expect(wrapper.vm.otherService1).toBe(wrapper.vm.otherService2);

        wrapper.unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 2：demo 计数器点击后同步更新，other 计数器不受影响
   *
   * 对于任意点击次数 n，通过 .btn-demo1 或 .btn-demo2 修改 demoService.count 后，
   * demo1-count 和 demo2-count 同步更新，other 计数器不变。
   */
  it('Property 2 — demo 计数器点击后同步更新，other 计数器不受影响', async () => {
    await fc.assert(
      fc.asyncProperty(
        arbClickTimes,
        fc.boolean(),
        async (clickTimes, useBtn1) => {
          const wrapper = mount(DemoComp, {
            global: {
              plugins: [
                declareAppProvidersPlugin([DemoService]),
                declareAppProvidersPlugin([OtherService]),
              ],
            },
          });

          const btnSelector = useBtn1 ? '.btn-demo1' : '.btn-demo2';
          const initialOther1 = wrapper.get('.other1-count').text();
          const initialOther2 = wrapper.get('.other2-count').text();
          let expectedCount = 100;

          for (let i = 0; i < clickTimes; i++) {
            await wrapper.get(btnSelector).trigger('click');
            expectedCount++;
            expect(wrapper.get('.demo1-count').text()).toBe(String(expectedCount));
            expect(wrapper.get('.demo2-count').text()).toBe(String(expectedCount));
            expect(wrapper.get('.other1-count').text()).toBe(initialOther1);
            expect(wrapper.get('.other2-count').text()).toBe(initialOther2);
          }

          wrapper.unmount();
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 3：demo 和 other 计数器相互独立
   *
   * 对于任意组合的点击操作，demo-count 和 other-count 相互独立。
   */
  it('Property 3 — demo 和 other 计数器相互独立', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 3 }),
        fc.integer({ min: 0, max: 3 }),
        async (demoClicks, otherClicks) => {
          const wrapper = mount(DemoComp, {
            global: {
              plugins: [
                declareAppProvidersPlugin([DemoService]),
                declareAppProvidersPlugin([OtherService]),
              ],
            },
          });

          for (let i = 0; i < demoClicks; i++) {
            await wrapper.get('.btn-demo1').trigger('click');
          }
          for (let i = 0; i < otherClicks; i++) {
            await wrapper.get('.btn-other1').trigger('click');
          }

          expect(wrapper.get('.demo1-count').text()).toBe(String(100 + demoClicks));
          expect(wrapper.get('.demo2-count').text()).toBe(String(100 + demoClicks));
          expect(wrapper.get('.other1-count').text()).toBe(String(200 + otherClicks));
          expect(wrapper.get('.other2-count').text()).toBe(String(200 + otherClicks));

          wrapper.unmount();
        }
      ),
      { numRuns: 20 }
    );
  });
});
