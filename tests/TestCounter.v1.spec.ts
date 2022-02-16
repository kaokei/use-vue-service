import 'reflect-metadata';

import { mount } from '@vue/test-utils';

import Counter from '@components/Counter.vue';

import CounterService from '@services/counter.service';
import { COUNTER_THEME } from '@services/service.context';

import { declareProviders, useService } from '@src/index';
import { defineComponent, isReactive } from 'vue';

const TestApp = defineComponent({
  template: '<Counter :name="name" :counter="counter"></Counter>',
  components: { Counter },
  props: ['name'],
  setup() {
    declareProviders([
      {
        provide: COUNTER_THEME,
        useValue: '#69c0ff',
      },
      // CounterService, // 这里不设置CounterService决定了这个服务是被缓存在use-vue-service中的默认的Injector中的，注意这个默认的Injector是所有Injector的根Injector。
    ]);
    const counterService = useService(CounterService);
    console.log(
      'isReactive(props.counterService) :>> ',
      isReactive(counterService)
    );
    return {
      counter: counterService,
    };
  },
});

describe('Component 没有声明服务CounterService', () => {
  test('渲染组件、获取服务数据', async () => {
    const wrapper = mount(TestApp, {
      props: {
        name: 'counter1',
      },
    });
    expect(wrapper.find('.title').text()).toBe('counter1:');
    expect(wrapper.find('.countNum').text()).toBe('0');

    await wrapper.find('.incrementBtn').trigger('click');
    expect(wrapper.vm.counter.count).toBe(1);
    expect(wrapper.find('.countNum').text()).toBe('1');

    await wrapper.find('.decrementBtn').trigger('click');
    expect(wrapper.find('.countNum').text()).toBe('0');

    wrapper.vm.counter.add(10);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.countNum').text()).toBe('10');

    wrapper.vm.counter.minus(5);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.countNum').text()).toBe('5');
  });

  test('组件快照、服务共享', async () => {
    const wrapper = mount(TestApp, {
      props: {
        name: 'counter2',
      },
    });
    expect(wrapper.find('.title').text()).toBe('counter2:');
    // 因为共享共享CounterService，所以是5，注意上一个test的最终执行结果就是5
    expect(wrapper.find('.countNum').text()).toBe('5');
    await wrapper.vm.$nextTick();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
