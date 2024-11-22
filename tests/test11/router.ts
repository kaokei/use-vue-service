import { createWebHistory, createRouter } from 'vue-router';

import HomeView from './HomeView.vue';
import AboutView from './AboutView.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/about', component: AboutView },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

export const TYPES = {
  route: Symbol('route001'),
  router: Symbol('router001'),
};
