<template>
  <div class="container">
    <h4>ClassA</h4>
    <div>
      <Counter name="ClassA Counter" :counter="counterService"></Counter>
    </div>
  </div>
</template>

<script>
import { reactive, provide, inject, defineComponent } from 'vue';

import { useService, declareProviders } from '@src/index';

import CounterService from '@services/counter.service';

import { COUNTER_THEME } from '@services/service.context';

import Counter from '@components/Counter.vue';

export default defineComponent({
  name: 'ClassA',
  components: {
    Counter,
  },
  setup() {
    declareProviders([
      {
        provide: COUNTER_THEME,
        useValue: '#ff7875',
      },
      CounterService,
    ]);
    const counterService = useService(CounterService);
    const theme = useService(COUNTER_THEME);
    console.log('theme :>> ', theme);

    provide(COUNTER_THEME, 'qqqqqqq');
    debugger;
    const theme1 = inject(COUNTER_THEME);
    console.log('from class a theme1 :>> ', theme1);
    return {
      counterService,
    };
  },
});
</script>

<style lang="css" scoped>
.container {
  margin: 0 auto;
}
</style>
