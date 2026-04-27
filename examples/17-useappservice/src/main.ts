/**
 * 应用入口
 *
 * 1. 在 App 级容器中绑定 SharedService（name = 'App级'）
 * 2. 将 app 实例通过 provide 注入组件树，供子组件获取
 */
import { createApp } from 'vue';
import { declareAppProvidersPlugin } from '@kaokei/use-vue-service';
import App from './App.vue';
import { SharedService } from './SharedService';

const app = createApp(App);

// App 级绑定：设置 name = 'App级' 以便区分
app.use(
  declareAppProvidersPlugin((container) => {
    container.bind(SharedService).toDynamicValue(() => {
      const s = new SharedService();
      s.name = 'App级';
      return s;
    });
  })
);

// 将 app 实例注入组件树，子组件通过 inject('app') 获取
app.provide('app', app);

app.mount('#app');
