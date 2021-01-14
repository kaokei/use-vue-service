<template>
  <div class="container">
    <h4>Earth</h4>
    <div>
      <Counter name="Earth Counter" :counter="counterService"></Counter>
    </div>
    <div>
      <China></China>
    </div>
  </div>
</template>

<script>
import { reactive, defineComponent } from 'vue';

import { useService } from '@src/index';

import CounterService from '@services/counter.service';

import Counter from '@components/Counter.vue';

import China from './China/index.vue';

export default defineComponent({
  name: 'Earth',
  components: {
    Counter,
    China,
  },
  setup() {
    const counterService = useService(CounterService);
    return {
      counterService,
    };
  },
});
</script>
