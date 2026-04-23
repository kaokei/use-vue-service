import { mount } from '@vue/test-utils';
import DemoCompWithFindExpose from './DemoCompWithFindExpose.vue';
import ChildCompWithExpose from './ChildCompWithExpose.vue';
import { ChildService } from './ChildService';
import { useRootService, FIND_CHILD_SERVICE, FIND_CHILDREN_SERVICES } from '@/index';

describe('test19 — 组件级 useService 获取查找函数', () => {
  it('DemoComp 内 useService(FIND_CHILD_SERVICE) 返回的函数能查到 ChildService', () => {
    const wrapper = mount(DemoCompWithFindExpose);
    const childService = wrapper.vm.findChildService(ChildService);
    expect(childService).toBeInstanceOf(ChildService);
  });

  it('DemoComp 内 useService(FIND_CHILDREN_SERVICES) 返回 3 个 ChildService', () => {
    const wrapper = mount(DemoCompWithFindExpose);
    const list = wrapper.vm.findChildrenServices(ChildService);
    expect(list).toHaveLength(3);
    list.forEach(s => expect(s).toBeInstanceOf(ChildService));
  });

  it('组件级查找函数与 useRootService 均能找到 ChildService 实例（单棵子树时）', () => {
    const wrapper = mount(DemoCompWithFindExpose);
    const fromComp = wrapper.vm.findChildService(ChildService);
    const fromRoot = useRootService(FIND_CHILD_SERVICE)(ChildService);
    // 两者都应找到 ChildService 实例（同一底层对象，reactive 代理可能不同）
    expect(fromComp).toBeInstanceOf(ChildService);
    expect(fromRoot).toBeInstanceOf(ChildService);
    expect(fromComp).toStrictEqual(fromRoot);
  });

  it('关键边界 — ChildComp 内 useService(FIND_CHILD_SERVICE) 查 ChildService 返回 undefined（不含自身）', () => {
    const wrapper = mount(ChildCompWithExpose);
    // ChildService 注册在 ChildComp 自身容器，查找只往子孙走，不含自身
    const result = wrapper.vm.findChildService(ChildService);
    expect(result).toBeUndefined();
  });

  it('关键边界 — ChildComp 内 useService(FIND_CHILDREN_SERVICES) 查 ChildService 返回空数组', () => {
    const wrapper = mount(ChildCompWithExpose);
    const list = wrapper.vm.findChildrenServices(ChildService);
    expect(list).toEqual([]);
  });
});
