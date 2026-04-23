<script setup lang="ts">
import { declareProviders, useService } from '@/index';
import { DemoServiceWithInject } from './DemoServiceWithInject';
import ChildComp from './ChildComp.vue';

declareProviders([DemoServiceWithInject]);
const demoService = useService(DemoServiceWithInject);

defineExpose({ demoService });
</script>

<template>
  <div>
    <div class="demo-count">{{ demoService.count }}</div>
  </div>

  <div class="child-1-container">
    <ChildComp>
      <p>001</p>
    </ChildComp>
  </div>

  <div class="child-2-container">
    <ChildComp />
  </div>

  <div class="child-3-container">
    <Suspense>
      <ChildComp />
      <template #fallback>Loading...</template>
    </Suspense>
  </div>
</template>
