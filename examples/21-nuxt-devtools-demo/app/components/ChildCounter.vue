<script setup lang="ts">
import { CountService } from '~/services/CountService'

// 子组件声明独立容器
declareProviders([CountService])
const counter = useService(CountService)
</script>

<template>
  <div style="border: 1px solid #42b883; padding: 12px; border-radius: 4px;">
    <h3 style="margin: 0 0 8px;">子组件独立容器</h3>
    <p>计数：{{ counter.count }} （doubled：{{ counter.doubled }}）</p>
    <button @click="counter.increment">+1</button>
    <button @click="counter.decrement" style="margin-left: 8px;">-1</button>
    <button @click="counter.reset" style="margin-left: 8px;">重置</button>
  </div>
</template>
