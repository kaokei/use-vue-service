<template>
  <div class="container">
    <span
      >It does not trigger ShowCounter Component render when counterService.age
      changed</span
    >
    <button class="decrementBtn" type="button" @click="counter.decrement">-</button>
    <span class="countNum">count: {{ counter.count }}</span>
    <button class="incrementBtn" type="button" @click="counter.increment">+</button>
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
