<script setup lang="ts">
import { declareProviders, useService } from '@kaokei/use-vue-service'
import { CountService } from './CountService'

// 子组件声明自己的 CountService 容器（独立于父组件）
declareProviders([CountService])

const counter = useService(CountService)
</script>

<template>
  <div style="border: 1px solid #42b883; padding: 12px; margin-top: 12px; border-radius: 4px;">
    <h3>子组件（独立容器）</h3>
    <p>子组件计数：{{ counter.count }}</p>
    <button @click="counter.increment">+1</button>
    <button @click="counter.decrement" style="margin-left: 8px;">-1</button>
  </div>
</template>
