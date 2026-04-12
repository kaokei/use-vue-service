/**
 * 路由配置
 *
 * 定义两个路由：首页和关于页。
 * 每个路由对应一个独立的 .vue 组件，各自声明自己的服务实例。
 * 切换路由时，旧组件销毁、新组件创建，服务实例也随之重建。
 */
import { createRouter, createWebHashHistory } from 'vue-router';
import Home from './Home.vue';
import About from './About.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
