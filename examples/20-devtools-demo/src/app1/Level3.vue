<script setup lang="ts">
import { declareProviders, useService } from '@kaokei/use-vue-service'
import { CountService } from '../services'
import Level4 from './Level4.vue'

// Level3 声明自己的 CountService（独立于 App 根组件的 CountService）
declareProviders([CountService])

const counter = useService(CountService)
</script>

<template>
  <div style="border: 1px solid #66bb6a; padding: 8px; margin-top: 8px; border-radius: 4px;">
    <h2>Level3 (独立 CountService)</h2>
    <p>独立计数：{{ counter.count }} <button @click="counter.increment">+1</button> <button @click="counter.decrement">-1</button></p>
    <Level4 />
  </div>
</template>
