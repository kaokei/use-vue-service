<script setup lang="ts">
import { DemoService } from './DemoService';
import { useService } from '@/index';

// 没有调用 declareProviders，直接使用 useService
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
