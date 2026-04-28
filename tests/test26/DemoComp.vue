<script setup lang="ts">
import { declareProviders, useService } from '@/index';
import { WatchService } from './WatchService';

declareProviders([WatchService]);
const watchService = useService(WatchService);

defineExpose({ watchService });
</script>

<template>
  <div>
    <div class="count">{{ watchService.count }}</div>
    <div class="watch-call-count">{{ watchService.watchCallCount }}</div>
    <button class="btn-inc" @click="watchService.count++">加一</button>
  </div>
</template>
