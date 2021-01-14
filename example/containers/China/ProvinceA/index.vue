<template>
  <div class="container">
    <h4>ProvinceA</h4>
    <div>
      <Counter name="ProvinceA Counter" :counter="counterService"></Counter>
    </div>
    <div>
      <SchoolA></SchoolA>
    </div>
  </div>
</template>

<script>
import { reactive, defineComponent } from 'vue';

import { useService } from '@src/index';

import CounterService from '@services/counter.service';

import Counter from '@components/Counter.vue';

import SchoolA from './SchoolA/index.vue';

export default defineComponent({
  name: 'ProvinceA',
  components: {
    Counter,
    SchoolA,
  },
  setup() {
    const counterService = useService(CounterService);
    return {
      counterService,
    };
  },
});
</script>
