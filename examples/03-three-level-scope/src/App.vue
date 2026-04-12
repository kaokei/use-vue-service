<script setup lang="ts">
/**
 * 三层级服务作用域示例 - 根组件
 *
 * 演示三层容器的层级覆盖关系：
 * - 全局根级：通过 declareRootProviders 在 main.ts 中声明（scope = '全局根级'）
 * - App 级：通过 declareAppProvidersPlugin 在 main.ts 中声明（scope = 'App 级'）
 * - 组件级：通过 declareProviders 在当前组件中声明（scope = '组件级'）
 *
 * 关键点：
 * - useRootService 始终从全局根容器获取，返回 scope = '全局根级'
 * - useAppService 从 App 级容器获取，返回 scope = 'App 级'
 * - useService 从最近的组件级容器获取，返回 scope = '组件级'（因为当前组件声明了覆盖）
 */
import { getCurrentInstance } from 'vue';
import {
  declareProviders,
  useService,
  useRootService,
  useAppService,
} from '@kaokei/use-vue-service';
import { ConfigService } from './ConfigService';
import Child from './Child.vue';

// 第三层：在组件级容器中声明 ConfigService，设置 scope 为 '组件级'
// 组件级容器继承自 App 级容器，此处的绑定会覆盖 App 级的 ConfigService
declareProviders((container) => {
  container.bind(ConfigService).toDynamicValue(() => {
    const service = new ConfigService();
    service.scope = '组件级';
    return service;
  });
});

// 从组件级容器获取 ConfigService（scope = '组件级'）
const componentConfig = useService(ConfigService);

// 从全局根容器获取 ConfigService（scope = '全局根级'）
const rootConfig = useRootService(ConfigService);

// 从 App 级容器获取 ConfigService（scope = 'App 级'）
const app = getCurrentInstance()!.appContext.app;
const appConfig = useAppService(ConfigService, app);
</script>

<template>
  <div>
    <h1>03 - 三层级服务作用域</h1>
    <p>演示组件级、App 级、全局根级三层服务作用域的层级覆盖关系</p>

    <h2>当前组件中获取的 ConfigService</h2>
    <table border="1" cellpadding="8" cellspacing="0">
      <thead>
        <tr>
          <th>获取方式</th>
          <th>scope 值</th>
          <th>说明</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>useRootService</td>
          <td>{{ rootConfig.scope }}</td>
          <td>始终从全局根容器获取</td>
        </tr>
        <tr>
          <td>useAppService</td>
          <td>{{ appConfig.scope }}</td>
          <td>从 App 级容器获取</td>
        </tr>
        <tr>
          <td>useService</td>
          <td>{{ componentConfig.scope }}</td>
          <td>从最近的组件级容器获取（覆盖了 App 级）</td>
        </tr>
      </tbody>
    </table>

    <h2>子组件中的 ConfigService</h2>
    <Child />
  </div>
</template>
