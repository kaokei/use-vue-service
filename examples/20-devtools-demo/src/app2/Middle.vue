<script setup lang="ts">
import { declareProviders, useService } from '@kaokei/use-vue-service'
import { LoggerService } from '../services/LoggerService'
import Deep from './Deep.vue'

// Middle 声明自己的容器
declareProviders([LoggerService])

const logger = useService(LoggerService)
</script>

<template>
  <div style="border: 1px solid #2196f3; padding: 8px; margin-top: 8px; border-radius: 4px;">
    <h2>Middle</h2>
    <p>日志数量：{{ logger.logs.length }} <button @click="logger.log('app2-log')">添加日志</button></p>
    <Deep />
  </div>
</template>
