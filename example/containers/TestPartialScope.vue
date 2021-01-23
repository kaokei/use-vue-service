<template>
  <div>
    <div>
      <button type="button" @click="counterService.decrement">-</button>
      <span>count: {{ counterService.count }}</span>
      <button type="button" @click="counterService.increment">+</button>

      <button type="button" @click="counterService.decrementAge" class="ml20">-</button>
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
  name: 'App',
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
