/**
 * 应用入口
 *
 * 创建 Vue 应用，注册 vue-router 和全局样式，挂载到 DOM。
 */
import './index.css';
import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');
