<script setup lang="ts">
import { declareProviders, useService } from '@kaokei/use-vue-service'
import { LoggerService, CountService } from '../services'
import { ROOT_COUNT_TOKEN } from '../services/RootCountService'
import Child from './Child.vue'

// 根组件自身容器（LoggerService 由 App Container 提供，CountService 声明在组件级）
declareProviders([CountService])

const logger = useService(LoggerService)
const counter = useService(CountService)
const rootCounter = useService(ROOT_COUNT_TOKEN)
</script>

<template>
  <div>
    <h1>App 3 - 轻量场景</h1>
    <p>日志数量：{{ logger.logs.length }} <button @click="logger.log('app3-log')">添加日志</button> <button @click="logger.clear">清空</button></p>
    <p>组件计数：{{ counter.count }} <button @click="counter.increment">+1</button> <button @click="counter.decrement">-1</button></p>
    <p>根级计数：{{ rootCounter.count }} <button @click="rootCounter.increment">+1</button> <button @click="rootCounter.decrement">-1</button></p>
    <Child />
  </div>
</template>