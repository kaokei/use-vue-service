<script setup lang="ts">
/**
 * 树形作用域测试页面
 *
 * 演示多层级组件树中的服务作用域隔离与继承：
 * - 每个层级可以声明自己的服务实例，覆盖父级的绑定
 * - 未声明新服务的组件会继承最近祖先的服务实例
 * - 相同背景色的区域共享同一个服务实例
 *
 * 层级结构：Global -> Earth -> China -> Province -> School -> Class
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CounterService } from '../services/CounterService';
import { CountdownService } from '../services/CountdownService';
import { LoggerService } from '../services/LoggerService';
import { SwitchService } from '../services/SwitchService';
import { COUNTER_THEME, COUNTDOWN_THEME } from '../services/tokens';
import CounterView from '../components/CounterView.vue';
import CountdownView from '../components/CountdownView.vue';
import Earth from './tree/Earth.vue';

// 在最顶层声明全局服务
declareProviders((container) => {
  container.bind(LoggerService).toSelf();
  container.bind(SwitchService).toSelf();
  container.bind(CounterService).toSelf();
  container.bind(CountdownService).toSelf();
  container.bind(COUNTER_THEME).toConstantValue('#69c0ff');
  container.bind(COUNTDOWN_THEME).toConstantValue('#69c0ff');
});

const counterService = useService(CounterService);
const switchService = useService(SwitchService);
</script>

<template>
  <div>
    <div>
      <div>
        <CounterView name="Global Counter" :counter="counterService" />
      </div>
      <div class="mt5">
        <CountdownView name="Global Countdown" :minus="10" :add="10" />
      </div>
    </div>
    <div>
      <Earth />
    </div>
    <div class="switch-box">
      <h4>相同背景色的区域共享同一个服务实例</h4>
      <div>
        <button type="button" @click="switchService.toggleCounterStatus">
          {{ switchService.counterStatus === 1 ? '隐藏' : '显示' }} Counter 背景色
        </button>
      </div>
      <div class="mt5">
        <button type="button" @click="switchService.toggleCountdownStatus">
          {{ switchService.countdownStatus === 1 ? '隐藏' : '显示' }} Countdown 背景色
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.switch-box {
  background: #fff1b8;
  position: fixed;
  left: 10px;
  top: 10px;
  text-align: left;
  padding: 20px;
}
</style>
