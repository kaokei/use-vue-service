<script setup lang="ts">
/**
 * 展示 CounterService 的 count 属性
 *
 * 通过 useService 获取与父组件共享的 CounterService 实例，
 * 只展示和操作 count 属性。
 */
import { useService } from '@kaokei/use-vue-service';
import { CounterService } from '../../services/CounterService';

const counter = useService(CounterService);
</script>

<template>
  <div>
    <span class="mr10">ShowCounter 组件，只依赖 CounterService 的 count 属性：</span>
    <button type="button" @click="counter.decrement">-</button>
    <span>count: {{ counter.count }}</span>
    <button type="button" @click="counter.increment">+</button>
  </div>
</template>
