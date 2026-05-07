<script setup lang="ts">
import { declareProviders, useService } from '@kaokei/use-vue-service'
import { LoggerService } from '../services/LoggerService'
import Level3 from './Level3.vue'

// Level2 声明自己的容器
declareProviders([LoggerService])

const logger = useService(LoggerService)
</script>

<template>
  <div style="border: 1px solid #4caf50; padding: 8px; margin-top: 8px; border-radius: 4px;">
    <h2>Level2</h2>
    <p>日志数量：{{ logger.logs.length }} <button @click="logger.log('hello')">添加日志</button> <button @click="logger.clear">清空</button></p>
    <Level3 />
  </div>
</template>
