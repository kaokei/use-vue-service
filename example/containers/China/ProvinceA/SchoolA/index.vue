<template>
  <div class="container">
    <h4>SchoolA</h4>
    <div>
      <Counter name="SchoolA Counter" :counter="counterService"></Counter>
    </div>
    <div class="box">
      <ClassA></ClassA>
      <ClassB></ClassB>
    </div>
  </div>
</template>

<script>
import { reactive, provide, inject, defineComponent } from 'vue';

import { useService, declareProviders } from '@src/index';

import CounterService from '@services/counter.service';
import { COUNTER_THEME } from '@services/service.context';

import Counter from '@components/Counter.vue';

import ClassA from './ClassA/index.vue';
import ClassB from './ClassB/index.vue';

export default defineComponent({
  name: 'SchoolA',
  components: {
    Counter,
    ClassA,
    ClassB,
  },
  setup() {
    declareProviders([
      {
        provide: COUNTER_THEME,
        useValue: '#ff9c6e',
      },
      CounterService,
    ]);
    const counterService = useService(CounterService);

    provide(COUNTER_THEME, 'school a');
    const theme1 = inject(COUNTER_THEME);
    console.log('from School A theme1 :>> ', theme1);
    return {
      counterService,
    };
  },
});
</script>

<style lang="css" scoped>
.box {
  width: 400px;
  margin: 0 auto;
  display: flex;
}
</style>
