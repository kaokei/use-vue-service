<script setup lang="ts">
import { DemoService } from './DemoService';
import { AppService } from './AppService';
import { RootService } from './RootService';
import { declareProviders, useService } from '../../src/index';

defineProps({
  msg: String,
});

declareProviders([DemoService]);
const service = useService(DemoService);
const appService = useService(AppService);
const rootService = useService(RootService);

defineExpose({
  service,
  appService,
  rootService,
});
</script>

<template>
  <div>
    <div class="msg">{{ msg }}</div>
    <div class="demo-count">{{ service.count }}</div>
    <div class="app-count">{{ appService.count }}</div>
    <div class="root-count">{{ rootService.count }}</div>

    <button
      type="button"
      class="btn-demo-count"
      @click="service.increaseCount()"
    >
      Add count demo
    </button>
    <button
      type="button"
      class="btn-app-count"
      @click="appService.increaseCount()"
    >
      Add count app
    </button>
    <button
      type="button"
      class="btn-root-count"
      @click="rootService.increaseCount()"
    >
      Add count root
    </button>
  </div>
</template>
