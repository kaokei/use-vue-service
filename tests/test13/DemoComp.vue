<script setup lang="ts">
import { DemoService } from './DemoService';
import { useService } from '../../src/index';

defineProps({
  msg: String,
});

console.log('before useService');
const service = useService(DemoService);
console.log('after useService', service);

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
