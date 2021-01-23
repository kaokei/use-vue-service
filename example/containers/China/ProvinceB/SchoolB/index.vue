<template>
  <div class="container">
    <h4>SchoolB</h4>
    <div>
      <div>
        <Counter name="SchoolB Counter" :counter="counterService"></Counter>
      </div>
      <div class="mt5">
        <Countdown name="SchoolB Countdown" :minus="20" :add="20"></Countdown>
      </div>
    </div>
    <div class="box">
      <ClassA></ClassA>
      <ClassB></ClassB>
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

import ClassA from './ClassA/index.vue';
import ClassB from './ClassB/index.vue';

export default defineComponent({
  name: 'SchoolB',
  components: {
    Counter,
    Countdown,
    ClassA,
    ClassB,
  },
  setup() {
    declareProviders([
      {
        provide: COUNTDOWN_THEME,
        useValue: '#b37feb',
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
  width: 620px;
  margin: 0 auto;
  display: flex;
}
</style>
