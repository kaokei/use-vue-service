import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import ParentComp from './ParentComp.vue';
import { ParentService } from './ParentService';
import ChildComp from './ChildComp.vue';
import { ChildService } from './ChildService';

describe('test4', () => {
  it('get DemoService instance', async () => {
    const wrapper = mount(DemoComp);
    const parentWrapper = wrapper.getComponent(ParentComp);
    const childWrapper = parentWrapper.getComponent(ChildComp);
    const demoService = wrapper.vm.demoService;
    const parentService = parentWrapper.vm.parentService;
    const parentDemoService = parentWrapper.vm.demoService;
    const childService = childWrapper.vm.childService;
    const childParentService = childWrapper.vm.parentService;
    const childDemoService = childWrapper.vm.demoService;

    expect(demoService).toBeInstanceOf(DemoService);
    expect(parentService).toBeInstanceOf(ParentService);
    expect(parentDemoService).toBeInstanceOf(DemoService);
    expect(childService).toBeInstanceOf(ChildService);
    expect(childParentService).toBeInstanceOf(ParentService);
    expect(childDemoService).toBeInstanceOf(DemoService);

    expect(parentDemoService).toBe(demoService);
    expect(childDemoService).toBe(demoService);
    expect(childParentService).toBe(parentService);

    expect(childService.demoService).toBe(demoService);
    expect(childService.parentService).toBe(parentService);
    expect(parentService.demoService).toBe(demoService);

    const demoCount = wrapper.get('.demo-count');
    const btnDemo = wrapper.get('.btn-demo');

    const parentDemoCount = wrapper.get('.parent-demo-count');
    const parentDemoCount2 = wrapper.get('.parent-demo-count-2');
    const parentCount = wrapper.get('.parent-count');
    const btnParentDemo = wrapper.get('.btn-parent-demo');
    const btnParent = wrapper.get('.btn-parent');

    const childDemoCount = wrapper.get('.child-demo-count');
    const childDemoCount2 = wrapper.get('.child-demo-count-2');
    const childParentCount = wrapper.get('.child-parent-count');
    const childParentCount2 = wrapper.get('.child-parent-count-2');
    const childCount = wrapper.get('.child-count');
    const btnChildDemo = wrapper.get('.btn-child-demo');
    const btnChildParent = wrapper.get('.btn-child-parent');
    const btnChild = wrapper.get('.btn-child');

    expect(demoCount.text()).toBe('100');
    expect(parentDemoCount.text()).toBe('100');
    expect(parentDemoCount2.text()).toBe('100');
    expect(parentCount.text()).toBe('200');
    expect(childDemoCount.text()).toBe('100');
    expect(childDemoCount2.text()).toBe('100');
    expect(childParentCount.text()).toBe('200');
    expect(childParentCount2.text()).toBe('200');
    expect(childCount.text()).toBe('300');

    await btnDemo.trigger('click');
    expect(demoCount.text()).toBe('101');
    expect(parentDemoCount.text()).toBe('101');
    expect(parentDemoCount2.text()).toBe('101');
    expect(parentCount.text()).toBe('200');
    expect(childDemoCount.text()).toBe('101');
    expect(childDemoCount2.text()).toBe('101');
    expect(childParentCount.text()).toBe('200');
    expect(childParentCount2.text()).toBe('200');
    expect(childCount.text()).toBe('300');

    await btnParentDemo.trigger('click');
    expect(demoCount.text()).toBe('102');
    expect(parentDemoCount.text()).toBe('102');
    expect(parentDemoCount2.text()).toBe('102');
    expect(parentCount.text()).toBe('200');
    expect(childDemoCount.text()).toBe('102');
    expect(childDemoCount2.text()).toBe('102');
    expect(childParentCount.text()).toBe('200');
    expect(childParentCount2.text()).toBe('200');
    expect(childCount.text()).toBe('300');

    await btnParent.trigger('click');
    expect(demoCount.text()).toBe('102');
    expect(parentDemoCount.text()).toBe('102');
    expect(parentDemoCount2.text()).toBe('102');
    expect(parentCount.text()).toBe('210');
    expect(childDemoCount.text()).toBe('102');
    expect(childDemoCount2.text()).toBe('102');
    expect(childParentCount.text()).toBe('210');
    expect(childParentCount2.text()).toBe('210');
    expect(childCount.text()).toBe('300');

    await btnChildDemo.trigger('click');
    expect(demoCount.text()).toBe('103');
    expect(parentDemoCount.text()).toBe('103');
    expect(parentDemoCount2.text()).toBe('103');
    expect(parentCount.text()).toBe('210');
    expect(childDemoCount.text()).toBe('103');
    expect(childDemoCount2.text()).toBe('103');
    expect(childParentCount.text()).toBe('210');
    expect(childParentCount2.text()).toBe('210');
    expect(childCount.text()).toBe('300');

    await btnChildParent.trigger('click');
    expect(demoCount.text()).toBe('103');
    expect(parentDemoCount.text()).toBe('103');
    expect(parentDemoCount2.text()).toBe('103');
    expect(parentCount.text()).toBe('220');
    expect(childDemoCount.text()).toBe('103');
    expect(childDemoCount2.text()).toBe('103');
    expect(childParentCount.text()).toBe('220');
    expect(childParentCount2.text()).toBe('220');
    expect(childCount.text()).toBe('300');

    await btnChild.trigger('click');
    expect(demoCount.text()).toBe('103');
    expect(parentDemoCount.text()).toBe('103');
    expect(parentDemoCount2.text()).toBe('103');
    expect(parentCount.text()).toBe('220');
    expect(childDemoCount.text()).toBe('103');
    expect(childDemoCount2.text()).toBe('103');
    expect(childParentCount.text()).toBe('220');
    expect(childParentCount2.text()).toBe('220');
    expect(childCount.text()).toBe('400');
  });
});
