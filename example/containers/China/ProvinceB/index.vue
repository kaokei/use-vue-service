<template>
  <div class="container">
    <h4>ProvinceB</h4>
    <div>
      <Counter name="ProvinceB Counter" :counter="counterService"></Counter>
    </div>
    <div class="box">
      <SchoolA></SchoolA>
      <SchoolB></SchoolB>
    </div>
  </div>
</template>

<script>
import { reactive, defineComponent } from 'vue';

import { useService } from '@src/index';

import CounterService from '@services/counter.service';

import Counter from '@components/Counter.vue';

import SchoolA from './SchoolA/index.vue';
import SchoolB from './SchoolB/index.vue';

export default defineComponent({
  name: 'ProvinceB',
  components: {
    Counter,
    SchoolA,
    SchoolB,
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
  width: 800px;
  margin: 0 auto;
  display: flex;
}
</style>
