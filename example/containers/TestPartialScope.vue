<template>
  <div>
    <h2>
      There are three components share the same CounterService. And
      CounterService's data are reactive and works as expected.
    </h2>
    <div class="mt20">
      <span class="mr10"
        >This is Parent Component which depend on two attrs(age and count) of
        CounterService.</span
      >
      <button type="button" @click="counterService.decrement">-</button>
      <span>count: {{ counterService.count }}</span>
      <button type="button" @click="counterService.increment">+</button>

      <button type="button" @click="counterService.decrementAge" class="ml20">
        -
      </button>
      <span>age: {{ counterService.age }}</span>
      <button type="button" @click="counterService.incrementAge">+</button>
    </div>
    <ShowCounter class="mt5"></ShowCounter>
    <ShowAge class="mt5"></ShowAge>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { useService } from '@src/index';

import CounterService from '@services/counter.service';

import ShowCounter from '@containers/components/ShowCounter.vue';
import ShowAge from '@containers/components/ShowAge.vue';

export default defineComponent({
  name: 'TestPartialScope',
  components: {
    ShowCounter,
    ShowAge,
  },
  setup() {
    const counterService = useService(CounterService);
    return {
      counterService,
    };
  },
  mounted() {
    (document.querySelector('#app') as any).style.width = '100%';
  },
  unmounted() {
    (document.querySelector('#app') as any).style.width = 'max-content';
  },
});
</script>

<style lang="css" scoped></style>
