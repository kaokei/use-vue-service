<script setup lang="ts">
import { declareAppProviders, declareProviders, useService } from '@kaokei/use-vue-service'
import { LoggerService } from '../services'
import Child from './Child.vue'

// App 级别容器
declareAppProviders([LoggerService])

// 根组件自身容器
declareProviders([LoggerService])

const logger = useService(LoggerService)
</script>

<template>
  <div>
    <h1>App 3 - 轻量场景</h1>
    <p>日志数量：{{ logger.logs.length }} <button @click="logger.log('app3-log')">添加日志</button> <button @click="logger.clear">清空</button></p>
    <Child />
  </div>
</template>
