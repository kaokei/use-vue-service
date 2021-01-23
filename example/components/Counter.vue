<template>
  <div class="container" :style="{ background: bgTheme }">
    <span class="title">{{ name || 'defaultName' }}:</span>
    <button class="decrementBtn" type="button" @click="counter.decrement">-</button>
    <span class="countNum">{{ counter.count }}</span>
    <button class="incrementBtn" type="button" @click="counter.increment">+</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

import { useService } from '@src/index';

import { COUNTER_THEME } from '@services/service.context';
import SwitchService from '@services/switch.service';

// Counter组件是一个完全受控的组件
export default defineComponent({
  props: ['name', 'counter', 'bgColor'],
  setup(props) {
    const theme = useService(COUNTER_THEME);
    const switchService = useService(SwitchService);
    const bgTheme = computed(() => {
      if (switchService.counterStatus === 1) {
        return props.bgColor || theme.value;
      } else {
        return 'transparent';
      }
    });
    return {
      bgTheme,
    };
  },
});
</script>

<style scoped lang="css">
.container {
  display: inline-block;
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
