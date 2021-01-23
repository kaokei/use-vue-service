<template>
  <div class="container">
    <h4>ClassB</h4>
    <div>
      <div>
        <Counter name="ClassB Counter" :counter="counterService"></Counter>
      </div>
      <div class="mt5">
        <Countdown name="ClassB Countdown" :minus="10" :add="10"></Countdown>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, defineComponent } from 'vue';

import { useService } from '@src/index';

import CounterService from '@services/counter.service';

import Counter from '@components/Counter.vue';
import Countdown from '@components/Countdown.vue';

export default defineComponent({
  name: 'ClassB',
  components: {
    Counter,
    Countdown,
  },
  setup() {
    const counterService = useService(CounterService);
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
