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
    ]);
    // 调用2次declareProviders就会报错
    declareProviders([
      CounterService, // 这里设置CounterService决定了这个服务是被缓存在当前组件所对应的Injector中的，那么如果有多个组件实例意味着服务也是多例的。
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

describe('Component 声明了服务CounterService', () => {
  test('渲染组件、获取服务数据', async () => {
    expect(() => {
      mount(TestApp, {
        props: {
          name: 'counter1',
        },
      });
    }).toThrow();
  });
});
