<script setup lang="ts">
import { declareProviders, useService } from '@/index';
import { DemoService } from './DemoService';
import { OtherService } from './OtherService';
import { TYPES } from './token';

declareProviders(con => {
  con.bind(TYPES.DemoService).to(DemoService);
  con.bind(TYPES.OtherService).to(OtherService);
});
const demoService = useService(TYPES.DemoService);
const otherService = useService(TYPES.OtherService);

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
