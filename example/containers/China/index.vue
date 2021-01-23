<template>
  <div class="container">
    <h4>China</h4>
    <div>
      <div>
        <Counter name="China Counter" :counter="counterService"></Counter>
      </div>
      <div class="mt5">
        <Countdown name="China Countdown" :minus="60" :add="60"></Countdown>
      </div>
    </div>
    <div class="box">
      <ProvinceA></ProvinceA>
      <ProvinceB></ProvinceB>
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

import ProvinceA from './ProvinceA/index.vue';
import ProvinceB from './ProvinceB/index.vue';

export default defineComponent({
  name: 'China',
  components: {
    Counter,
    Countdown,
    ProvinceA,
    ProvinceB,
  },
  setup() {
    declareProviders([
      {
        provide: COUNTER_THEME,
        useValue: '#d3f261',
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
  width: 2480px;
  margin: 0 auto;
  display: flex;
}
</style>
