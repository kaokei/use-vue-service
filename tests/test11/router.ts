import {
  createWebHistory,
  createRouter,
  Router,
  RouteLocationNormalizedLoaded,
} from 'vue-router';
import { Token } from '@/index';

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
  route: new Token<RouteLocationNormalizedLoaded>('route001'),
  router: new Token<Router>('router001'),
};
