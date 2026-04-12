<script setup lang="ts">
/**
 * 子组件
 *
 * 子组件自身没有通过 declareProviders 声明 ConfigService，
 * 因此 useService 会沿组件树向上查找，找到父组件（App.vue）声明的组件级容器。
 * 所以子组件获取到的 ConfigService 的 scope 值为 '组件级'，
 * 这证明了组件级容器的作用域会向下传递给子组件。
 */
import { useService } from '@kaokei/use-vue-service';
import { ConfigService } from './ConfigService';

// 从最近的祖先组件的容器中获取 ConfigService
// 由于父组件 App.vue 声明了组件级的 ConfigService（scope = '组件级'），
// 子组件会继承该绑定
const config = useService(ConfigService);
</script>

<template>
  <div>
    <p>
      子组件通过 useService 获取的 ConfigService scope：
      <strong>{{ config.scope }}</strong>
    </p>
    <p>
      （子组件未声明自己的 ConfigService，继承了父组件的组件级容器，所以 scope = '组件级'）
    </p>
  </div>
</template>
