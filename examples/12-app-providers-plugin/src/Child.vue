<script setup lang="ts">
/**
 * 子组件
 *
 * 演示 App 级服务的共享特性：
 * - 子组件通过 useService 获取的 AppConfigService 与根组件是同一个实例
 * - App 级服务在整个应用范围内共享，所有组件都能访问
 */
import { useService } from '@kaokei/use-vue-service';
import { AppConfigService } from './AppConfigService';

// 获取与根组件相同的 App 级服务实例
const configService = useService(AppConfigService);
</script>

<template>
  <div>
    <h2>子组件中获取的配置</h2>
    <p>应用名称：{{ configService.appName }}</p>
    <p>版本号：{{ configService.version }}</p>
  </div>
</template>
