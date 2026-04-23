<script setup lang="ts">
import { declareProviders, useService } from '@/index';
import { DemoService } from './DemoService';

declareProviders([DemoService]);
const demoService = useService(DemoService);

const scope = demoService.setup();

defineExpose({ demoService, scope });
</script>

<template>
  <div>
    <div class="count">{{ demoService.count }}</div>
  </div>
</template>
