<script setup lang="ts">
import { DemoService } from './DemoService';
import { declareProviders, useService } from '@/index';

const props = defineProps({
  msg: String,
});

const emit = defineEmits<{
  (e: 'count', count: number): void;
}>();

declareProviders([DemoService]);
const service = useService(DemoService);

defineExpose({
  service,
});

service.setComponentMsg(props.msg || '');

function handleCount() {
  service.increaseCount();
  emit('count', service.count);
}
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
    <button type="button" class="btn-count" @click="handleCount">
      Add count
    </button>
  </div>
</template>
