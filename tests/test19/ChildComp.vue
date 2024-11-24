<script setup lang="ts">
import { declareProviders, useService } from '../../src/index';
import { ChildService } from './ChildService';

declareProviders([ChildService]);
const childService = useService(ChildService);

defineExpose({
  childService,
});
</script>

<template>
  <div>
    <div class="child-count">{{ childService.count }}</div>

    <button
      type="button"
      class="btn-count-child"
      @click="childService.increaseCount()"
    >
      Add count child
    </button>

    <div>
      <slot>default content</slot>
    </div>
  </div>
</template>
