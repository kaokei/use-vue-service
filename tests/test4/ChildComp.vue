<script setup lang="ts">
import { declareProviders, useService } from '@/index';
import { DemoService } from './DemoService';
import { ParentService } from './ParentService';
import { ChildService } from './ChildService';

declareProviders([ChildService]);
const demoService = useService(DemoService);
const parentService = useService(ParentService);
const childService = useService(ChildService);

defineExpose({
  demoService,
  parentService,
  childService,
});
</script>

<template>
  <div>
    <div class="child-demo-count">{{ demoService.count }}</div>
    <div class="child-demo-count-2">{{ childService.demoService.count }}</div>
    <div class="child-parent-count">{{ parentService.count }}</div>
    <div class="child-parent-count-2">
      {{ childService.parentService.count }}
    </div>
    <div class="child-count">{{ childService.count }}</div>

    <button
      type="button"
      class="btn-child-demo"
      @click="demoService.increaseCount()"
    >
      Demo add count
    </button>
    <button
      type="button"
      class="btn-child-parent"
      @click="parentService.increaseCount()"
    >
      Parent add count
    </button>
    <button
      type="button"
      class="btn-child"
      @click="childService.increaseCount()"
    >
      Child add count
    </button>
  </div>
</template>
