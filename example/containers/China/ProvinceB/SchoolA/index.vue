<template>
  <div class="container">
    <h4>SchoolA</h4>
    <div>
      <Counter name="SchoolA Counter" :counter="counterService"></Counter>
    </div>
    <div class="box">
      <ClassA></ClassA>
      <ClassB></ClassB>
    </div>
  </div>
</template>

<script>
import { reactive, defineComponent } from 'vue';

import { useService } from '@src/index';

import CounterService from '@services/counter.service';

import Counter from '@components/Counter.vue';

import ClassA from './ClassA/index.vue';
import ClassB from './ClassB/index.vue';

export default defineComponent({
  name: 'SchoolA',
  components: {
    Counter,
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
  width: 400px;
  margin: 0 auto;
  display: flex;
}
</style>
