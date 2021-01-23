<template>
  <div class="container">
    <h4>ProvinceA</h4>
    <div>
      <div>
        <Counter name="ProvinceA Counter" :counter="counterService"></Counter>
      </div>
      <div class="mt5">
        <Countdown name="ProvinceA Countdown" :minus="10" :add="10"></Countdown>
      </div>
    </div>
    <div class="box">
      <SchoolA></SchoolA>
      <SchoolB></SchoolB>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, defineComponent } from 'vue';

import { useService, declareProviders } from '@src/index';

import CounterService from '@services/counter.service';
import { COUNTER_THEME } from '@services/service.context';

import Counter from '@components/Counter.vue';
import Countdown from '@components/Countdown.vue';

import SchoolA from './SchoolA/index.vue';
import SchoolB from './SchoolB/index.vue';

export default defineComponent({
  name: 'ProvinceA',
  components: {
    Counter,
    Countdown,
    SchoolA,
    SchoolB,
  },
  setup() {
    declareProviders([
      {
        provide: COUNTER_THEME,
        useValue: '#ffc069',
      },
      CounterService,
    ]);
    const counterService = useService(CounterService);
    return {
      counterService,
    };
  },
});
</script>

<style lang="css" scoped>
.box {
  width: 1240px;
  margin: 0 auto;
  display: flex;
}
</style>
