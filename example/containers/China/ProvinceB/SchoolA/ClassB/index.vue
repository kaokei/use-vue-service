<template>
  <div class="container">
    <h4>ClassB</h4>
    <div>
      <Counter name="ClassB Counter" :counter="counterService"></Counter>
    </div>
  </div>
</template>

<script>
import { reactive, defineComponent } from 'vue';

import { useService } from '@src/index';

import CounterService from '@services/counter.service';

import Counter from '@components/Counter.vue';

export default defineComponent({
  name: 'ClassB',
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

<style lang="css" scoped>
.container {
  margin: 0 auto;
}
</style>
