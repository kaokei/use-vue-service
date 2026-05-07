<script setup lang="ts">
import { declareProviders, useService } from '@kaokei/use-vue-service'
import { CountService, UserService } from '../services'

// Child 声明自己的容器
declareProviders([CountService, UserService])

const counter = useService(CountService)
const user = useService(UserService)
</script>

<template>
  <div style="border: 1px solid #ff9800; padding: 8px; margin-top: 8px; border-radius: 4px;">
    <h2>Child (独立容器)</h2>
    <p>独立计数：{{ counter.count }} <button @click="counter.increment">+1</button></p>
    <p>独立用户：{{ user.name }} <button @click="user.setName('孙七')">改名</button></p>
  </div>
</template>
