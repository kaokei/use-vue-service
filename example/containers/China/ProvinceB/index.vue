<template>
  <div class="container">
    <h4>ProvinceB</h4>
    <div>
      <div>
        <Counter name="ProvinceB Counter" :counter="counterService"></Counter>
      </div>
      <div class="mt5">
        <Countdown name="ProvinceB Countdown" :minus="30" :add="30"></Countdown>
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
import CountdownService from '@services/countdown.service';
import { COUNTDOWN_THEME } from '@services/service.context';

import Counter from '@components/Counter.vue';
import Countdown from '@components/Countdown.vue';

import SchoolA from './SchoolA/index.vue';
import SchoolB from './SchoolB/index.vue';

export default defineComponent({
  name: 'ProvinceB',
  components: {
    Counter,
    Countdown,
    SchoolA,
    SchoolB,
  },
  setup() {
    declareProviders([
      {
        provide: COUNTDOWN_THEME,
        useValue: '#85a5ff',
      },
      CountdownService,
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
