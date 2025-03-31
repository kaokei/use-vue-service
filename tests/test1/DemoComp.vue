<script setup lang="ts">
import { DemoService } from './DemoService';
import { declareProviders, useService } from '@/index';

defineProps({
  msg: String,
});

declareProviders([DemoService]);
const service = useService(DemoService);

defineExpose({
  service,
});
</script>

<template>
  <div>
    <div class="msg">{{ msg }}</div>
    <div class="count">{{ service.count }}</div>
    <div class="age">{{ service.age }}</div>
    <div class="name">{{ service.name }}</div>
    <div class="computedName">{{ service.computedName }}</div>

    <button type="button" class="btn-age" @click="service.increaseAge()">
      Add age
    </button>
    <button type="button" class="btn-count" @click="service.increaseCount()">
      Add count
    </button>
  </div>
</template>
