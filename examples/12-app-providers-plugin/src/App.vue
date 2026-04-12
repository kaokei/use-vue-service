<script setup lang="ts">
/**
 * 根组件
 *
 * 演示在根组件中通过 useService 获取 App 级服务：
 * - AppConfigService 已通过 declareAppProvidersPlugin 注册到 App 级容器
 * - 无需在组件内调用 declareProviders，直接 useService 即可获取
 * - 子组件 Child 也能获取到同一个 AppConfigService 实例
 */
import { useService } from '@kaokei/use-vue-service';
import { AppConfigService } from './AppConfigService';
import Child from './Child.vue';

// 直接获取 App 级服务，无需在组件内声明
const configService = useService(AppConfigService);
</script>

<template>
  <div>
    <h1>12 - App 级服务插件</h1>
    <p>演示 declareAppProvidersPlugin 以 Vue 插件形式声明 App 级服务</p>

    <div>
      <h2>根组件中获取的配置</h2>
      <p>应用名称：{{ configService.appName }}</p>
      <p>版本号：{{ configService.version }}</p>
    </div>

    <hr />

    <!-- 子组件也能获取同一个 App 级服务实例 -->
    <Child />
  </div>
</template>
