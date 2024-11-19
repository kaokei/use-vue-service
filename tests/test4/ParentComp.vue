<script setup lang="ts">
import { declareProviders, useService } from '../../src/index';
import { DemoService } from './DemoService';
import { ParentService } from './ParentService';
import ChildComp from './ChildComp.vue';

declareProviders([ParentService]);
const demoService = useService(DemoService);
const parentService = useService(ParentService);

defineExpose({
  demoService,
  parentService,
});
</script>

<template>
  <div>
    <div class="parent-demo-count">{{ demoService.count }}</div>
    <div class="parent-demo-count-2">{{ parentService.demoService.count }}</div>
    <div class="parent-count">{{ parentService.count }}</div>

    <button
      type="button"
      class="btn-parent-demo"
      @click="demoService.increaseCount()"
    >
      Demo add count
    </button>
    <button
      type="button"
      class="btn-parent"
      @click="parentService.increaseCount()"
    >
      Parent add count
    </button>

    <ChildComp></ChildComp>
  </div>
</template>
