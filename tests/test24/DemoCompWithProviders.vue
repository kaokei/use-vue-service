<script setup lang="ts">
import { DemoService } from './DemoService';
import { declareProviders, useService } from '@/index';

declareProviders([DemoService]);
const demoService = useService(DemoService);

defineExpose({
  demoService,
});
</script>

<template>
  <div>
    <div class="demo-count">{{ demoService.count }}</div>
  </div>
</template>
