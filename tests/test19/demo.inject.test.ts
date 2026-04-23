import { mount } from '@vue/test-utils';
import DemoCompWithInject from './DemoCompWithInject.vue';
import { ChildService } from './ChildService';
import { DemoServiceWithInject } from './DemoServiceWithInject';

describe('test19 — @Inject 装饰器注入查找函数', () => {
  it('注入的 findChild 是函数类型', () => {
    const wrapper = mount(DemoCompWithInject);
    expect(typeof wrapper.vm.demoService.findChild).toBe('function');
  });

  it('注入的 findChildren 是函数类型', () => {
    const wrapper = mount(DemoCompWithInject);
    expect(typeof wrapper.vm.demoService.findChildren).toBe('function');
  });

  it('demoService.findChild(ChildService) 返回 ChildService 实例', () => {
    const wrapper = mount(DemoCompWithInject);
    const result = wrapper.vm.demoService.findChild(ChildService);
    expect(result).toBeInstanceOf(ChildService);
  });

  it('demoService.findChildren(ChildService) 返回 3 个 ChildService 实例', () => {
    const wrapper = mount(DemoCompWithInject);
    const list = wrapper.vm.demoService.findChildren(ChildService);
    expect(list).toHaveLength(3);
    list.forEach(s => expect(s).toBeInstanceOf(ChildService));
  });

  it('注入的 findChild 与 findChildren[0] 查到的是同一个底层实例', () => {
    const wrapper = mount(DemoCompWithInject);
    const single = wrapper.vm.demoService.findChild(ChildService);
    const list = wrapper.vm.demoService.findChildren(ChildService);
    expect(single).toStrictEqual(list[0]);
  });

  it('边界 — 查未注册的 Service 返回 undefined', () => {
    const wrapper = mount(DemoCompWithInject);
    // DemoServiceWithInject 注册在当前组件容器，findChild 不含自身，查不到
    const result = wrapper.vm.demoService.findChild(DemoServiceWithInject);
    expect(result).toBeUndefined();
  });

  it('边界 — 批量查未注册的 Service 返回空数组', () => {
    const wrapper = mount(DemoCompWithInject);
    const list = wrapper.vm.demoService.findChildren(DemoServiceWithInject);
    expect(list).toEqual([]);
  });
});
