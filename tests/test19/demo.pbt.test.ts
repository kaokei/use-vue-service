/**
 * test19 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：子组件服务查找（FIND_CHILD_SERVICE / FIND_CHILDREN_SERVICES）
 * 验证：子服务查找的类型正确性、数量一致性
 */

import fc from 'fast-check';
import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { ChildService } from './ChildService';
import {
  FIND_CHILDREN_SERVICES,
  FIND_CHILD_SERVICE,
  useRootService,
} from '@/index';

describe('test19 — 属性基测试', () => {
  /**
   * Property 1：FIND_CHILD_SERVICE 始终返回 ChildService 实例
   *
   * 无论挂载多少次，通过 FIND_CHILD_SERVICE 查找到的第一个子服务
   * 始终是 ChildService 的实例。
   */
  it('Property 1 — FIND_CHILD_SERVICE 始终返回 ChildService 实例', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const wrapper = mount(DemoComp);

        const findChildService = useRootService(FIND_CHILD_SERVICE);
        const childService = findChildService(ChildService);

        expect(childService).toBeInstanceOf(ChildService);

        wrapper.unmount();
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property 2：FIND_CHILDREN_SERVICES 始终返回固定数量的子服务列表
   *
   * 无论挂载多少次，通过 FIND_CHILDREN_SERVICES 查找到的子服务列表
   * 始终包含 3 个 ChildService 实例。
   */
  it('Property 2 — FIND_CHILDREN_SERVICES 始终返回 3 个子服务', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const wrapper = mount(DemoComp);

        const findChildrenServices = useRootService(FIND_CHILDREN_SERVICES);
        const childServiceList = findChildrenServices(ChildService);

        expect(childServiceList.length).toBe(3);
        childServiceList.forEach((service) => {
          expect(service).toBeInstanceOf(ChildService);
        });

        wrapper.unmount();
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property 3：FIND_CHILD_SERVICE 返回的实例是 FIND_CHILDREN_SERVICES 列表的第一个
   *
   * 无论挂载多少次，FIND_CHILD_SERVICE 返回的实例始终等于
   * FIND_CHILDREN_SERVICES 返回列表的第一个元素。
   */
  it('Property 3 — FIND_CHILD_SERVICE 返回的实例是列表的第一个', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const wrapper = mount(DemoComp);

        const findChildService = useRootService(FIND_CHILD_SERVICE);
        const findChildrenServices = useRootService(FIND_CHILDREN_SERVICES);

        const childService = findChildService(ChildService);
        const childServiceList = findChildrenServices(ChildService);

        expect(childService).toBe(childServiceList[0]);

        wrapper.unmount();
      }),
      { numRuns: 10 }
    );
  });
});
