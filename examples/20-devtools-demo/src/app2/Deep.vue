<script setup lang="ts">
import { declareProviders, useService } from '@kaokei/use-vue-service'
import { CountService } from '../services'

// Deep 声明自己的 CountService
declareProviders([CountService])

const counter = useService(CountService)
</script>

<template>
  <div style="border: 1px solid #64b5f6; padding: 8px; margin-top: 8px; border-radius: 4px;">
    <h2>Deep (独立 CountService)</h2>
    <p>独立计数：{{ counter.count }} <button @click="counter.increment">+1</button></p>
  </div>
</template>
