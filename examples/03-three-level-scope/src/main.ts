/**
 * 三层级服务作用域示例 - 入口文件
 *
 * 演示三层容器的声明顺序：
 * 1. 先通过 declareRootProviders 在全局根容器中声明 ConfigService（scope = '全局根级'）
 * 2. 再通过 declareAppProvidersPlugin 在 App 级容器中声明 ConfigService（scope = 'App 级'）
 * 3. 组件内部通过 declareProviders 在组件级容器中声明 ConfigService（scope = '组件级'）
 *
 * 容器继承关系：全局根级 → App 级 → 组件级
 * 获取服务时，优先从最近的容器中查找，因此组件级会覆盖 App 级，App 级会覆盖全局根级。
 */
import { createApp } from 'vue';
import {
  declareRootProviders,
  declareAppProvidersPlugin,
} from '@kaokei/use-vue-service';
import { ConfigService } from './ConfigService';
import App from './App.vue';

// 第一层：在全局根容器中声明 ConfigService，设置 scope 为 '全局根级'
declareRootProviders((container) => {
  container.bind(ConfigService).toDynamicValue(() => {
    const service = new ConfigService();
    service.scope = '全局根级';
    return service;
  });
});

const app = createApp(App);

// 第二层：通过 Vue 插件形式在 App 级容器中声明 ConfigService，设置 scope 为 'App 级'
// App 级容器继承自全局根容器，此处的绑定会覆盖根级的 ConfigService
app.use(
  declareAppProvidersPlugin((container) => {
    container.bind(ConfigService).toDynamicValue(() => {
      const service = new ConfigService();
      service.scope = 'App 级';
      return service;
    });
  })
);

app.mount('#app');
