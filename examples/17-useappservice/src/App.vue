<script setup lang="ts">
/**
 * 根组件
 *
 * 演示 useService 在根组件（无自身绑定）时直接获取 App 级服务。
 * 子组件 DeepChild 自己也绑定了一份 SharedService，
 * 观察 DeepChild 中 useService 与 useAppService 返回的是否为同一实例。
 */
import { useService } from '@kaokei/use-vue-service';
import { SharedService } from './SharedService';
import DeepChild from './DeepChild.vue';

// 根组件未调用 declareProviders，useService 回退到 App 级容器
const serviceInRoot = useService(SharedService);
</script>

<template>
  <div>
    <h1>17 - useAppService 与 useService 的查找层级差异</h1>

    <section>
      <h2>根组件（无自身绑定）</h2>
      <p>
        <code>useService</code> 获取的服务来源：
        <strong>{{ serviceInRoot.name }}</strong>
        （回退到 App 级容器）
      </p>
      <p>count = {{ serviceInRoot.count }}</p>
      <button @click="serviceInRoot.increaseCount()">App 级 +1</button>
    </section>

    <hr />
    <DeepChild />
  </div>
</template>
