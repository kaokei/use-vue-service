<script setup lang="ts">
import { declareAppProviders, declareProviders, useService } from '@kaokei/use-vue-service'
import { AuthService, ThemeService } from '../services'
import Middle from './Middle.vue'

// App 级别容器
declareAppProviders([AuthService])

// 根组件自身容器
declareProviders([ThemeService])

const theme = useService(ThemeService)
const auth = useService(AuthService)
</script>

<template>
  <div>
    <h1>App 2 - 认证场景</h1>
    <p>主题：{{ theme.theme }} <button @click="theme.toggle">切换主题</button></p>
    <p>登录状态：{{ auth.isLoggedIn ? '已登录 (' + auth.username + ')' : '未登录' }}
      <button @click="auth.login('赵六')">登录</button>
      <button @click="auth.logout">登出</button>
    </p>
    <Middle />
  </div>
</template>
