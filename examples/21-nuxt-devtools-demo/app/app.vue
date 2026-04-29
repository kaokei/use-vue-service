<script setup lang="ts">
import { CountService } from '~/services/CountService'
import { UserService } from '~/services/UserService'

// 根组件声明容器
declareProviders([CountService, UserService])

const counter = useService(CountService)
const user = useService(UserService)
</script>

<template>
  <div style="font-family: sans-serif; padding: 24px; max-width: 640px;">
    <h1>21 - Nuxt DevTools 体验</h1>
    <p style="color: #666;">点击右下角的 Nuxt DevTools 按钮 → "Components" 标签页查看组件树和状态</p>

    <section style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 6px;">
      <h2>用户服务（根容器）</h2>
      <p>姓名：<strong>{{ user.name }}</strong>，角色：<strong>{{ user.role }}</strong></p>
      <button @click="user.setName('李四')">切换姓名</button>
      <button @click="user.toggleRole" style="margin-left: 8px;">切换角色</button>
    </section>

    <section style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 6px;">
      <h2>计数服务（根容器）</h2>
      <p>计数：{{ counter.count }}，doubled：{{ counter.doubled }}</p>
      <button @click="counter.increment">+1</button>
      <button @click="counter.decrement" style="margin-left: 8px;">-1</button>
      <button @click="counter.reset" style="margin-left: 8px;">重置</button>
    </section>

    <section style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 6px;">
      <h2>子组件（各自独立容器）</h2>
      <ChildCounter />
      <div style="margin-top: 12px;">
        <ChildCounter />
      </div>
    </section>
  </div>
</template>
