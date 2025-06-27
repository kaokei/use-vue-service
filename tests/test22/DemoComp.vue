<script setup lang="ts">
import { DemoService } from './DemoService';
import { declareProviders, useService } from '@/index';
import { OtherService } from './OtherService';

defineProps({
  msg: String,
});

declareProviders([DemoService, OtherService]);
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

    <div class="count-parent">{{ service.count_parent }}</div>
    <div class="count-grand">{{ service.count_grand }}</div>
    <div class="count-base">{{ service.count_base }}</div>
    <div class="count-other">{{ service.otherService.count }}</div>

    <button type="button" class="btn-age" @click="service.increaseAge()">
      Add age
    </button>
    <button type="button" class="btn-count" @click="service.increaseCount()">
      Add count
    </button>
    <button
      type="button"
      class="btn-count-other"
      @click="service.otherService.increaseCount()"
    >
      Add count other
    </button>
  </div>
</template>
