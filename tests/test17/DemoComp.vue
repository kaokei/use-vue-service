<script setup lang="ts">
import { DemoService } from './DemoService';
import { OtherService } from './OtherService';
import { declareProviders, useService } from '@/index';

declareProviders([DemoService]);
declareProviders([OtherService]);
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
    <div class="other-count">{{ otherService.count }}</div>

    <button
      type="button"
      class="btn-count-demo"
      @click="demoService.increaseCount()"
    >
      Add count demo
    </button>

    <button
      type="button"
      class="btn-count-other"
      @click="otherService.increaseCount()"
    >
      Add count other
    </button>
  </div>
</template>
