import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { getEffectScope } from '@/index';
import { onScopeDispose } from 'vue';

describe('test19', () => {
  it('get DemoService instance', async () => {
    const wrapper = mount(DemoComp);

    const demoService = wrapper.vm.demoService;
    const scope = getEffectScope(demoService);
    const onScopeDisposeFn = vi.fn();

    scope.run(() => {
      onScopeDispose(onScopeDisposeFn);
    });

    expect(scope.active).toBe(true);
    expect(onScopeDisposeFn).not.toHaveBeenCalled();

    expect(wrapper.get('.demo-count').text()).toBe('1');
    expect(wrapper.get('.demo-sum').text()).toBe('101');

    await wrapper.get('.btn-count-demo').trigger('click');

    expect(wrapper.get('.demo-count').text()).toBe('2');
    expect(wrapper.get('.demo-sum').text()).toBe('102');

    wrapper.unmount();

    expect(scope.active).toBe(false);
    expect(onScopeDisposeFn).toHaveBeenCalledOnce();
  });
});
