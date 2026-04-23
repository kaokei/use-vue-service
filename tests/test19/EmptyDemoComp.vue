<script setup lang="ts">
import { declareProviders, useService } from '@/index';
import { DemoService } from './DemoService';

declareProviders([DemoService]);
const demoService = useService(DemoService);

defineExpose({ demoService });
</script>

<template>
  <div>
    <div class="demo-count">{{ demoService.count }}</div>
  </div>
</template>
