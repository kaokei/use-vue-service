<script setup lang="ts">
import {
  RouterLink,
  RouterView,
  useRoute,
  useRouter,
  Router,
  RouteLocationNormalizedLoaded,
} from 'vue-router';
import { DemoService } from './DemoService';
import { declareProviders, useService } from '../../src/index';
import { TYPES } from './router';

defineProps({
  msg: String,
});

declareProviders([DemoService]);
const service = useService(DemoService);
const route = useRoute();
const router = useRouter();
const rootRoute = useService<RouteLocationNormalizedLoaded>(TYPES.route);
const rootRouter = useService<Router>(TYPES.router);

defineExpose({
  service,
  route,
  router,
  rootRoute,
  rootRouter,
});
</script>

<template>
  <div>
    <div>
      <div class="msg">{{ msg }}</div>
      <div class="count">{{ service.count }}</div>

      <button type="button" class="btn-count" @click="service.increaseCount()">
        Add count
      </button>
    </div>

    <div class="fullpath1">{{ route.fullPath }}</div>
    <div class="fullpath2">{{ rootRoute.fullPath }}</div>
    <div class="fullpath3">{{ service.route.fullPath }}</div>
    <div class="fullpath4">{{ service.router.currentRoute.value.fullPath }}</div>

    <nav>
      <RouterLink class="route-home" to="/">Go to Home</RouterLink>
      <RouterLink class="route-about" to="/about">Go to About</RouterLink>
    </nav>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>
