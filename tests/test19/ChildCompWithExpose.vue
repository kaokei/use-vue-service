<script setup lang="ts">
import { declareProviders, useService } from '@/index';
import { ChildService } from './ChildService';
import {
  FIND_CHILD_SERVICE,
  FIND_CHILDREN_SERVICES,
} from '@/index';

declareProviders([ChildService]);
const childService = useService(ChildService);
const findChildService = useService(FIND_CHILD_SERVICE);
const findChildrenServices = useService(FIND_CHILDREN_SERVICES);

defineExpose({
  childService,
  findChildService,
  findChildrenServices,
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
  </div>
</template>
