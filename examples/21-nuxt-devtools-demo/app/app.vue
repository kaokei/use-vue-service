<script setup lang="ts">
const route = useRoute()

const navItems = [
  { to: '/', label: '🏠 首页（DevTools 体验）' },
  { to: '/cart', label: '🛒 购物车服务' },
  { to: '/products', label: '📦 商品列表服务' },
  { to: '/notification', label: '🔔 通知队列服务' },
  { to: '/http', label: '🌐 HTTP 请求服务' },
  { to: '/form', label: '📝 表单验证服务' },
  { to: '/search', label: '🔍 搜索分页服务' },
  { to: '/countdown', label: '⏱ 倒计时服务' },
]

function isActive(path: string): boolean {
  return route.path === path
}
</script>

<template>
  <div style="font-family: sans-serif; display: flex; min-height: 100vh;">
    <!-- 左侧导航 -->
    <nav style="
      width: 200px;
      flex-shrink: 0;
      padding: 24px 16px;
      background: #f8f9fa;
      border-right: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    ">
      <div style="font-size: 13px; font-weight: 700; color: #999; margin-bottom: 8px; padding: 0 8px;">
        @kaokei/use-vue-service
      </div>
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :style="{
          display: 'block',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '14px',
          textDecoration: 'none',
          color: isActive(item.to) ? '#fff' : '#333',
          background: isActive(item.to) ? '#42b883' : 'transparent',
          fontWeight: isActive(item.to) ? '600' : '400',
        }"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>

    <!-- 右侧内容 -->
    <main style="flex: 1; padding: 24px 32px; overflow-x: auto;">
      <NuxtPage />
    </main>
  </div>
</template>
