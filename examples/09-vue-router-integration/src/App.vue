<script setup lang="ts">
/**
 * 根组件
 *
 * 提供路由导航链接和路由视图容器。
 * 每个路由组件独立声明自己的服务，切换路由时服务实例随组件生命周期创建和销毁。
 */
</script>

<template>
  <div>
    <h1>09 - Vue Router 集成</h1>
    <p>演示在路由组件中使用 declareProviders + useService 声明和获取服务</p>

    <nav style="margin: 16px 0;">
      <router-link to="/">首页</router-link>
      <span style="margin: 0 8px;">|</span>
      <router-link to="/about">关于</router-link>
    </nav>

    <hr />

    <!-- 路由视图：切换路由时组件销毁重建，服务实例也随之重建 -->
    <router-view />
  </div>
</template>
