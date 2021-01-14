<template>
  <div>
    <span class="title">{{ name || 'defaultName' }}: </span>
    <button type="button" @click="counter.decrement">-</button>
    <span class="countNum">{{ counter.count }}</span>
    <button type="button" @click="counter.increment">+</button>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  props: ['name', 'counter'],
});
</script>

<style scoped lang="css">
.title {
  font-weight: bold;
  margin-right: 10px;
  font-size: 14px;
}
.countNum {
  padding: 0 5px;
}
</style>
