<template>
  <div class="container">
    <h4>China</h4>
    <div>
      <Counter name="China Counter" :counter="counterService"></Counter>
    </div>
    <div>
      <ProvinceA></ProvinceA>
    </div>
  </div>
</template>

<script>
import { reactive, defineComponent } from 'vue';

import { useService } from '@src/index';

import CounterService from '@services/counter.service';

import Counter from '@components/Counter.vue';

import ProvinceA from './ProvinceA/index.vue';

export default defineComponent({
  name: 'China',
  components: {
    Counter,
    ProvinceA,
  },
  setup() {
    const counterService = useService(CounterService);
    return {
      counterService,
    };
  },
});
</script>
