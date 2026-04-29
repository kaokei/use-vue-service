<script setup lang="ts">
import { declareProviders, useService } from '@kaokei/use-vue-service'
import { CountService } from './CountService'
import { UserService } from './UserService'
import ChildComponent from './ChildComponent.vue'

// 根组件声明两个 Service
declareProviders([CountService, UserService])

const counter = useService(CountService)
const user = useService(UserService)
</script>

<template>
  <div style="font-family: sans-serif; padding: 24px; max-width: 600px;">
    <h1>20 - DevTools 体验</h1>
    <p style="color: #666;">点击右下角的 Vue DevTools 按钮打开调试面板</p>

    <section style="margin-top: 24px;">
      <h2>根组件容器</h2>
      <p>用户：{{ user.name }} ({{ user.role }})</p>
      <button @click="user.setName('李四')">切换用户</button>

      <p style="margin-top: 12px;">根组件计数：{{ counter.count }}</p>
      <button @click="counter.increment">+1</button>
      <button @click="counter.decrement" style="margin-left: 8px;">-1</button>
    </section>

    <section style="margin-top: 24px;">
      <h2>子组件（独立容器，与根组件互不影响）</h2>
      <ChildComponent />
      <ChildComponent />
    </section>
  </div>
</template>
