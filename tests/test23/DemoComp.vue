<script setup lang="ts">
import { DemoService } from './DemoService';
import { declareProviders, useService } from '@/index';

declareProviders([DemoService]);
const service = useService(DemoService);

defineExpose({
  service,
});
</script>

<template>
  <div>
    <div class="x">{{ service.x }}</div>
    <div class="computedX">{{ service.computedX }}</div>
    <div class="getX">{{ service.getX }}</div>
    <div class="getComputedX">{{ service.getComputedX }}</div>

    <button type="button" class="btn-x" @click="service.increaseX()">
      Add x
    </button>
  </div>
</template>
