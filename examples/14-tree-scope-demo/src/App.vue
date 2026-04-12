<script setup lang="ts">
/**
 * 根组件
 *
 * 提供路由导航链接和路由视图容器。
 * 三个路由页面分别演示不同的服务作用域场景。
 */
</script>

<template>
  <div>
    <h1>14 - 树形作用域演示</h1>
    <p>演示多层级组件树中的服务作用域隔离与继承</p>

    <nav style="margin: 16px 0;">
      <router-link to="/">树形作用域</router-link>
      <span style="margin: 0 8px;">|</span>
      <router-link to="/partial">局部作用域</router-link>
      <span style="margin: 0 8px;">|</span>
      <router-link to="/ref-and-reactive">Ref 与 Reactive</router-link>
    </nav>

    <hr />

    <router-view />
  </div>
</template>
