<template>
  <div class="container">
    <span
      >It does not trigger ShowAge Component render when counterService.count
      changed</span
    >
    <button class="decrementBtn" type="button" @click="counter.decrementAge">-</button>
    <span class="countNum">age: {{ counter.age }}</span>
    <button class="incrementBtn" type="button" @click="counter.incrementAge">+</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { useService } from '@src/index';

import CounterService from '@services/counter.service';

export default defineComponent({
  renderTriggered({ key, target, type }) {
    console.log('ShowAge Component: ', { key, target, type });
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
