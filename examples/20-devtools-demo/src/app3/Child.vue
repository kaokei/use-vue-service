<script setup lang="ts">
import { declareProviders, useService } from '@kaokei/use-vue-service'
import { CountService, UserService } from '../services'
import { ROOT_COUNT_TOKEN } from '../services/RootCountService'

// Child 声明自己的容器
declareProviders([CountService, UserService])

const counter = useService(CountService)
const user = useService(UserService)
const rootCounter = useService(ROOT_COUNT_TOKEN)
</script>

<template>
  <div style="border: 1px solid #ff9800; padding: 8px; margin-top: 8px; border-radius: 4px;">
    <h2>Child (独立容器)</h2>
    <p>独立计数：{{ counter.count }} <button @click="counter.increment">+1</button> <button @click="counter.decrement">-1</button></p>
    <p>独立用户：{{ user.name }} <button @click="user.setName('孙七')">改名</button></p>
    <p>根级计数：{{ rootCounter.count }} <button @click="rootCounter.increment">+1</button> <button @click="rootCounter.decrement">-1</button></p>
  </div>
</template>