/**
 * 路由配置
 *
 * 定义三个路由页面：
 * - 树形作用域：展示多层级组件树中的服务作用域隔离与继承
 * - 局部作用域：展示多个组件共享同一个服务实例
 * - Ref 与 Reactive：展示 Vue 响应式数据的深层响应特性
 */
import { createRouter, createWebHashHistory } from 'vue-router';
import TestTreeScope from './pages/TestTreeScope.vue';
import TestPartialScope from './pages/TestPartialScope.vue';
import TestRefAndReactive from './pages/TestRefAndReactive.vue';

const routes = [
  { path: '/', component: TestTreeScope },
  { path: '/partial', component: TestPartialScope },
  { path: '/ref-and-reactive', component: TestRefAndReactive },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
