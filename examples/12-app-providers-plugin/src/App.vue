<script setup lang="ts">
/**
 * App 级服务插件示例 - 根组件
 *
 * 演示：
 * 1. useService 获取 App 级服务（无需 declareProviders）
 * 2. useAppService(token, app) 在组件内通过 app 实例显式获取 App 级服务
 * 3. 两者返回同一个实例（因为都来自 App 级容器）
 */
import { inject } from 'vue';
import type { App } from 'vue';
import { useService, useAppService } from '@kaokei/use-vue-service';
import { AppConfigService } from './AppConfigService';
import Child from './Child.vue';

// 方式1：useService 自动沿组件树向上查找，找到 App 级容器中的 AppConfigService
const configViaUseService = useService(AppConfigService);

// 方式2：通过 inject 获取 app 实例，再用 useAppService 显式从 App 级容器获取
const app = inject<App>('app')!;
const configViaUseAppService = useAppService(AppConfigService, app);

// 两者来自同一容器，是同一实例
const isSameInstance = configViaUseService === configViaUseAppService;
</script>

<template>
  <div>
    <h1>12 - App 级服务插件</h1>

    <section>
      <h2>useService 获取 App 级服务</h2>
      <p>应用名称：{{ configViaUseService.appName }}</p>
      <p>版本号：{{ configViaUseService.version }}</p>
    </section>

    <section>
      <h2>useAppService vs useService</h2>
      <p>
        两者来自同一 App 级容器，是同一实例：
        <strong :style="{ color: isSameInstance ? 'green' : 'red' }">
          {{ isSameInstance }}
        </strong>
      </p>
      <p>
        <code>useAppService</code> 适合在组件外（路由守卫、工具函数）显式指定 app 实例获取服务。
      </p>
    </section>

    <hr />
    <Child />
  </div>
</template>
