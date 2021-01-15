<template>
  <div class="container" :style="{ background: theme }">
    <span class="title">{{ name || 'defaultName' }}:</span>
    <button class="decrementBtn" type="button" @click="counter.decrement">-</button>
    <span class="countNum">{{ counter.count }}</span>
    <button class="incrementBtn" type="button" @click="counter.increment">+</button>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

import { useService } from '@src/index';

import { COUNTER_THEME } from '@services/service.context';

export default defineComponent({
  props: ['name', 'counter'],
  setup() {
    const theme = useService(COUNTER_THEME);
    return {
      theme,
    };
  },
});
</script>

<style scoped lang="css">
.container {
  display: inline-block;
  background: #69c0ff;
  padding: 2px 5px;
}
.title {
  font-weight: bold;
  margin-right: 10px;
  font-size: 14px;
}
.countNum {
  padding: 0 5px;
}
</style>
