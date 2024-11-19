<script setup lang="ts">
import { declareProviders, useService } from '../../src/index';
import { DemoService } from './DemoService';
import ParentComp from './ParentComp.vue';

declareProviders([DemoService]);
const demoService = useService(DemoService);

defineExpose({
  demoService,
});
</script>

<template>
  <div>
    <div class="demo-count">{{ demoService.count }}</div>

    <button type="button" class="btn-demo" @click="demoService.increaseCount()">
      Demo add count
    </button>

    <ParentComp></ParentComp>
  </div>
</template>
