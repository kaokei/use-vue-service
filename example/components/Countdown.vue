<template>
  <div class="container" :style="{ background: bgTheme }">
    <span class="title">{{ name || 'defaultName' }}:</span>
    <button class="decrementBtn" type="button" @click="countdownService.minus(minus)">
      - {{ minus }}
    </button>
    <span class="countNum">{{ countdownService.time }}</span>
    <button class="incrementBtn" type="button" @click="countdownService.add(add)">
      + {{ add }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

import { useService } from '@src/index';

import { COUNTDOWN_THEME } from '@services/service.context';
import CountdownService from '@services/countdown.service';
import SwitchService from '@services/switch.service';

// Countdown组件则不是完全受控的组件
// Countdown组件完全依赖最近的declareProviders定义的服务
export default defineComponent({
  props: ['name', 'add', 'minus'],
  setup(props) {
    const [theme, countdownService, switchService] = useService([
      COUNTDOWN_THEME,
      CountdownService,
      SwitchService,
    ]);
    const bgTheme = computed(() => {
      if (switchService.countdownStatus === 1) {
        return theme.value;
      } else {
        return 'transparent';
      }
    });
    return {
      bgTheme,
      countdownService,
      switchService,
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
