<script setup lang="ts">
/**
 * 局部作用域测试页面
 *
 * 演示三个组件共享同一个 CounterService 实例。
 * CounterService 的数据是响应式的，任何组件修改都会同步更新。
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CounterService } from '../services/CounterService';
import { LoggerService } from '../services/LoggerService';
import ShowCounter from './partial/ShowCounter.vue';
import ShowAge from './partial/ShowAge.vue';

// 注册 CounterService 及其依赖的 LoggerService
declareProviders([CounterService, LoggerService]);

const counterService = useService(CounterService);
</script>

<template>
  <div>
    <h2>三个组件共享同一个 CounterService，数据响应式同步更新</h2>
    <div class="mt20">
      <span class="mr10">父组件，同时依赖 CounterService 的 age 和 count 属性：</span>
      <button type="button" @click="counterService.decrement">-</button>
      <span>count: {{ counterService.count }}</span>
      <button type="button" @click="counterService.increment">+</button>

      <button type="button" @click="counterService.decrementAge" class="ml20">-</button>
      <span>age: {{ counterService.age }}</span>
      <button type="button" @click="counterService.incrementAge">+</button>
    </div>
    <ShowCounter class="mt5" />
    <ShowAge class="mt5" />
  </div>
</template>
