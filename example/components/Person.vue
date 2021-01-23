<template>
  <div class="container" :style="{ background: bgTheme }">
    <span class="title">{{ name || 'defaultName' }}:</span>
    <button class="decrementBtn" type="button" @click="counter.decrement">-</button>
    <span class="countNum">{{ counter?.count }}</span>
    <button class="incrementBtn" type="button" @click="counter.increment">+</button>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';

import { useService, Component, Inject } from '@src/index';

import { COUNTER_THEME } from '@services/service.context';
import SwitchService from '@services/switch.service';
import CounterService from '@services/counter.service';

class Props {
  name?: string;
  bgColor?: string;
}

@Component({
  providers: [
    {
      provide: COUNTER_THEME,
      useValue: 'red',
    },
    CounterService,
  ],
})
export default class Person extends Vue.with(Props) {
  @Inject(COUNTER_THEME)
  public theme!: string;

  @Inject()
  public counter!: CounterService;

  @Inject()
  public switchService!: SwitchService;

  public get bgTheme() {
    if (this.switchService.counterStatus === 1) {
      return this.bgColor || this.theme;
    } else {
      return 'transparent';
    }
  }
}
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
