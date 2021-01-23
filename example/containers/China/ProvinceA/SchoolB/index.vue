<template>
  <div class="container">
    <h4>SchoolB</h4>
    <div>
      <div>
        <Counter name="SchoolB Counter" :counter="counterService"></Counter>
      </div>
      <div class="mt5">
        <Countdown name="SchoolB Countdown" :minus="10" :add="10"></Countdown>
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

import { useService } from '@src/index';

import CounterService from '@services/counter.service';

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
