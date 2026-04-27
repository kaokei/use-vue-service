<script setup lang="ts">
/**
 * 深层子组件——自己声明了一份 SharedService（name = '组件级'）
 *
 * 关键演示：
 * - useService → 从自己的容器获取（name = '组件级'）
 * - useAppService → 从 App 级容器获取（name = 'App级'）
 * - 两者是不同实例
 */
import { inject } from 'vue';
import type { App } from 'vue';
import { declareProviders, useService, useAppService } from '@kaokei/use-vue-service';
import { SharedService } from './SharedService';

// DeepChild 自己绑定一份 SharedService（name = '组件级'）
declareProviders((container) => {
  container.bind(SharedService).toDynamicValue(() => {
    const s = new SharedService();
    s.name = '组件级';
    return s;
  });
});

const serviceFromComponent = useService(SharedService);

const app = inject<App>('app')!;
const serviceFromApp = useAppService(SharedService, app);

const isSame = serviceFromComponent === serviceFromApp;
</script>

<template>
  <div style="border: 1px solid #ccc; padding: 12px; margin-top: 12px;">
    <h2>DeepChild（自身绑定了 SharedService）</h2>

    <table border="1" cellpadding="8" cellspacing="0">
      <thead>
        <tr>
          <th>获取方式</th>
          <th>name</th>
          <th>count</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>useService</code>（最近容器）</td>
          <td>{{ serviceFromComponent.name }}</td>
          <td>{{ serviceFromComponent.count }}</td>
          <td><button @click="serviceFromComponent.increaseCount()">+1</button></td>
        </tr>
        <tr>
          <td><code>useAppService</code>（App 级容器）</td>
          <td>{{ serviceFromApp.name }}</td>
          <td>{{ serviceFromApp.count }}</td>
          <td><button @click="serviceFromApp.increaseCount()">+1</button></td>
        </tr>
      </tbody>
    </table>

    <p style="margin-top: 12px;">
      两者是同一实例：
      <strong :style="{ color: isSame ? 'green' : 'red' }">
        {{ isSame }}
      </strong>
      （预期：<strong>false</strong>，因为组件级覆盖了 App 级）
    </p>
  </div>
</template>
