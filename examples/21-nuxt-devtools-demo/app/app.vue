<template>
  <div style="font-family: sans-serif; padding: 24px;">
    <!-- 页面导航 -->
    <nav style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e0e0e0; display: flex; gap: 16px;">
      <NuxtLink to="/" style="color: #42b883; text-decoration: none; font-weight: 600;">
        🏠 首页（DevTools 体验）
      </NuxtLink>
      <NuxtLink to="/cart" style="color: #42b883; text-decoration: none; font-weight: 600;">
        🛒 购物车服务
      </NuxtLink>
      <NuxtLink to="/products" style="color: #42b883; text-decoration: none; font-weight: 600;">
        📦 商品列表服务
      </NuxtLink>
      <NuxtLink to="/notification" style="color: #42b883; text-decoration: none; font-weight: 600;">
        🔔 通知队列服务
      </NuxtLink>
      <NuxtLink to="/http" style="color: #42b883; text-decoration: none; font-weight: 600;">
        🌐 HTTP 请求服务
      </NuxtLink>
      <NuxtLink to="/form" style="color: #42b883; text-decoration: none; font-weight: 600;">
        📝 表单验证服务
      </NuxtLink>
      <NuxtLink to="/search" style="color: #42b883; text-decoration: none; font-weight: 600;">
        🔍 搜索分页服务
      </NuxtLink>
      <NuxtLink to="/countdown" style="color: #42b883; text-decoration: none; font-weight: 600;">
        ⏱ 倒计时服务
      </NuxtLink>
    </nav>

    <!-- 页面内容 -->
    <NuxtPage />
  </div>
</template>
