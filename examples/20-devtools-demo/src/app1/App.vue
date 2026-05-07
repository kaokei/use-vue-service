<script setup lang="ts">
import { declareAppProviders, declareProviders, useService } from '@kaokei/use-vue-service'
import { CountService, UserService } from '../services'
import { ThemeService } from '../services/ThemeService'
import Level2 from './Level2.vue'

// App 级别容器：共享给所有子组件
declareAppProviders([ThemeService])

// 根组件自身容器
declareProviders([CountService, UserService])

const counter = useService(CountService)
const user = useService(UserService)
const theme = useService(ThemeService)
</script>

<template>
  <div>
    <h1>App 1 - 深层嵌套</h1>
    <p>主题：{{ theme.theme }} <button @click="theme.toggle">切换主题</button></p>
    <p>用户：{{ user.name }} ({{ user.role }}) <button @click="user.setName('李四')">改名</button></p>
    <p>计数：{{ counter.count }} <button @click="counter.increment">+1</button> <button @click="counter.decrement">-1</button></p>
    <Level2 />
  </div>
</template>
