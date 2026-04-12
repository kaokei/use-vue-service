/**
 * 应用入口
 *
 * 演示 declareAppProvidersPlugin 的用法：
 * 1. 调用 declareAppProvidersPlugin([...]) 返回一个 Vue 插件
 * 2. 通过 app.use() 安装该插件，即可在 App 级容器中声明服务
 * 3. 无需手动传递 app 实例（与 declareAppProviders 的区别）
 * 4. 应用内所有组件都可以通过 useService 获取这些 App 级服务
 */
import { createApp } from 'vue';
import { declareAppProvidersPlugin } from '@kaokei/use-vue-service';
import App from './App.vue';
import { AppConfigService } from './AppConfigService';

const app = createApp(App);

// 以 Vue 插件形式声明 App 级服务
app.use(declareAppProvidersPlugin([AppConfigService]));

app.mount('#app');
