<template>
  <div class="container">
    <h4>SchoolA</h4>
    <div>
      <Counter name="SchoolA Counter" :counter="counterService"></Counter>
    </div>
  </div>
</template>

<script>
import { reactive, defineComponent } from 'vue';
import { useService } from '@src';

import CounterService from '@services/counter.service';

import Counter from '@components/Counter.vue';

export default defineComponent({
  name: 'SchoolA',
  components: {
    Counter,
  },
  setup() {
    const counterService = useService(CounterService);
    return {
      counterService,
    };
  },
});
</script>
