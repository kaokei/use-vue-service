<script setup lang="ts">
import { DemoService } from './DemoService';
import { useService } from '@/index';

defineProps({
  msg: String,
});

const service = useService(DemoService);

defineExpose({
  service,
});
</script>

<template>
  <div>
    <div class="msg">{{ msg }}</div>
    <div class="count">{{ service.count }}</div>

    <button type="button" class="btn-count" @click="service.increaseCount()">
      Add count
    </button>
  </div>
</template>
