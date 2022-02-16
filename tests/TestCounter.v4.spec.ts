import 'reflect-metadata';

import { mount } from '@vue/test-utils';

import Counter from '@components/Counter.vue';

import CounterService from '@services/counter.service';
import { COUNTER_THEME } from '@services/service.context';

import { declareProviders, useService } from '@src/index';
import { defineComponent, isReactive, ref } from 'vue';

const TestAComponent = defineComponent({
  template:
    '<div id="a-component"><Counter :name="name" :counter="counter"></Counter></div>',
  components: { Counter },
  setup() {
    console.log('setup 111111');

    declareProviders([CounterService]);

    console.log('setup 2222222');

    const counterService = useService(CounterService);

    console.log('setup 333333');

    return {
      name: 'a-component',
      counter: counterService,
    };
  },
});

const TestBComponent = defineComponent({
  template:
    '<div id="b-component"><Counter :name="name" :counter="counter"></Counter></div>',
  components: { Counter },
  setup() {
    console.log('setup 444444');

    declareProviders([CounterService]);

    console.log('setup 5555555');

    const counterService = useService(CounterService);

    console.log('setup 666666');

    return {
      name: 'b-component',
      counter: counterService,
    };
  },
});

const TestApp = defineComponent({
  template:
    '<div><button id="btn-toggle" type="button" @click="toggleFlag">点我</button><div v-if="flag"><TestAComponent/></div><div v-else><TestBComponent/></div></div>',
  components: { TestAComponent, TestBComponent },
  setup() {
    console.log('setup 0000001');

    declareProviders([
      {
        provide: COUNTER_THEME,
        useValue: '#69c0ff',
      },
    ]);

    const flag = ref(true);

    const toggleFlag = () => {
      flag.value = !flag.value;
    };

    console.log('setup 0000002');

    return {
      flag,
      toggleFlag,
    };
  },
});

describe('通过if-else来测试onUnmount事件', () => {
  test('渲染组件、获取服务数据', async () => {
    const wrapper = mount(TestApp);

    expect(wrapper.vm.flag).toBe(true);

    expect(wrapper.findComponent(TestAComponent).exists()).toBe(true);
    expect(wrapper.find('#a-component').exists()).toBe(true);

    expect(wrapper.findComponent(TestBComponent).exists()).toBe(false);
    expect(wrapper.find('#b-component').exists()).toBe(false);

    await wrapper.find('#btn-toggle').trigger('click');

    expect(wrapper.vm.flag).toBe(false);

    expect(wrapper.findComponent(TestAComponent).exists()).toBe(false);
    expect(wrapper.find('#a-component').exists()).toBe(false);

    expect(wrapper.findComponent(TestBComponent).exists()).toBe(true);
    expect(wrapper.find('#b-component').exists()).toBe(true);
  });
});
