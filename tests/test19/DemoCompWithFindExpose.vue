<script setup lang="ts">
import { declareProviders, useService } from '@/index';
import { DemoService } from './DemoService';
import { FIND_CHILD_SERVICE, FIND_CHILDREN_SERVICES } from '@/index';
import ChildComp from './ChildComp.vue';

declareProviders([DemoService]);
const demoService = useService(DemoService);
const findChildService = useService(FIND_CHILD_SERVICE);
const findChildrenServices = useService(FIND_CHILDREN_SERVICES);

defineExpose({
  demoService,
  findChildService,
  findChildrenServices,
});
</script>

<template>
  <div>
    <div class="demo-count">{{ demoService.count }}</div>
  </div>

  <div class="child-1-container">
    <ChildComp>
      <p>001</p>
      <p>002</p>
      <p>003</p>
    </ChildComp>
  </div>

  <div class="child-2-container">
    <div class="child-2-wrapper">
      <div class="child-2-box">
        <ChildComp />
      </div>
    </div>
  </div>

  <div class="child-3-container">
    <Suspense>
      <ChildComp />
      <template #fallback>Loading...</template>
    </Suspense>
  </div>
</template>
