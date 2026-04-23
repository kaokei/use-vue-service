import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { OtherService } from './OtherService';

describe('test18 — LazyToken 解决循环依赖', () => {
  it('组件挂载不抛错', () => {
    expect(() => {
      mount(DemoComp);
    }).not.toThrowError();
  });

  it('DemoService 和 OtherService 实例类型正确', () => {
    const wrapper = mount(DemoComp);
    expect(wrapper.vm.demoService).toBeInstanceOf(DemoService);
    expect(wrapper.vm.otherService).toBeInstanceOf(OtherService);
  });

  it('循环依赖注入成功 — DemoService.otherService 指向 OtherService 实例', () => {
    const wrapper = mount(DemoComp);
    expect(wrapper.vm.demoService.otherService).toBeInstanceOf(OtherService);
  });

  it('循环依赖注入成功 — OtherService.demoService 指向 DemoService 实例', () => {
    const wrapper = mount(DemoComp);
    expect(wrapper.vm.otherService.demoService).toBeInstanceOf(DemoService);
  });

  it('循环引用对象同一性 — 注入的实例与 useService 获取的实例相同', () => {
    const wrapper = mount(DemoComp);
    const { demoService, otherService } = wrapper.vm;
    // demoService 中注入的 otherService 应与顶层的 otherService 是同一个单例
    expect(demoService.otherService).toBe(otherService);
    // otherService 中注入的 demoService 应与顶层的 demoService 是同一个单例
    expect(otherService.demoService).toBe(demoService);
  });

  it('模板渲染 count 初始值正确', () => {
    const wrapper = mount(DemoComp);
    expect(wrapper.get('.demo-count').text()).toBe('1');
    expect(wrapper.get('.other-count').text()).toBe('1');
  });

  it('点击按钮后 demoService.count 递增', async () => {
    const wrapper = mount(DemoComp);
    await wrapper.get('.btn-count-demo').trigger('click');
    expect(wrapper.get('.demo-count').text()).toBe('2');
    expect(wrapper.get('.other-count').text()).toBe('1');
  });

  it('点击按钮后 otherService.count 递增', async () => {
    const wrapper = mount(DemoComp);
    await wrapper.get('.btn-count-other').trigger('click');
    expect(wrapper.get('.demo-count').text()).toBe('1');
    expect(wrapper.get('.other-count').text()).toBe('2');
  });
});
