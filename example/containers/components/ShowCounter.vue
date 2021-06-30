<template>
  <div class="container">
    <span class="mr10"
      >This is ShowCounter Component which depend on only one attr(count) of
      CounterService.</span
    >
    <button class="decrementBtn" type="button" @click="counter.decrement">
      -
    </button>
    <span class="countNum">count: {{ counter.count }}</span>
    <button class="incrementBtn" type="button" @click="counter.increment">
      +
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { useService } from '@src/index';

import CounterService from '@services/counter.service';

export default defineComponent({
  renderTriggered({ key, target, type }) {
    console.log('ShowCounter Component', { key, target, type });
  },
  setup() {
    const counter = useService(CounterService);
    return {
      counter,
    };
  },
});
</script>

<style scoped lang="css"></style>
