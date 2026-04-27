/**
 * App 级服务插件示例 - 入口文件
 *
 * 演示：
 * 1. declareAppProvidersPlugin 以 Vue 插件形式注册 App 级服务
 * 2. 通过 app.provide('app', app) 将 app 实例注入组件树，
 *    使组件内可以通过 inject('app') 获取 app 引用，进而调用 useAppService
 */
import { createApp } from 'vue';
import { declareAppProvidersPlugin } from '@kaokei/use-vue-service';
import App from './App.vue';
import { AppConfigService } from './AppConfigService';

const app = createApp(App);

// 以 Vue 插件形式声明 App 级服务
app.use(declareAppProvidersPlugin([AppConfigService]));

// 将 app 实例注入组件树，供子组件通过 inject('app') 获取
app.provide('app', app);

app.mount('#app');
