<script setup lang="ts">
import { declareProviders, useService } from '../../src/index';
import { DemoService } from './DemoService';
import { OtherService } from './OtherService';

declareProviders([DemoService, OtherService]);
const demoService = useService(DemoService);
const otherService = useService(OtherService);

defineExpose({
  demoService,
  otherService,
});
</script>

<template>
  <div>
    <div class="demo-count">{{ demoService.count }}</div>
    <div class="demo-sum">{{ demoService.sum }}</div>

    <div class="other-count">{{ otherService.count }}</div>

    <button type="button" class="btn-demo" @click="demoService.increaseCount()">
      Demo add count
    </button>

    <button
      type="button"
      class="btn-other"
      @click="otherService.increaseCount()"
    >
      Other add count
    </button>
  </div>
</template>
