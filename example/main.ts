import './index.css';
import 'reflect-metadata';
import * as VueRouter from 'vue-router';
import { createApp } from 'vue';

import TestPartialScope from './containers/TestPartialScope.vue';
import TestTreeScope from './containers/TestTreeScope.vue';
import TestRefAndReactive from './containers/TestRefAndReactive.vue';

import App from './App.vue';

const routes = [
  { path: '/', component: TestTreeScope },
  { path: '/partial', component: TestPartialScope },
  { path: '/refAndReactive', component: TestRefAndReactive },
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
});

const app = createApp(App);

app.use(router);

app.mount('#app');
