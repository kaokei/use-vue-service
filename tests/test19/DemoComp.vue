<script setup lang="ts">
import {
  declareProviders,
  useService,
  CURRENT_COMPONENT,
} from '../../src/index';
import { DemoService } from './DemoService';
import ChildComp from './ChildComp.vue';
import { getCurrentInstance } from 'vue';

declareProviders([DemoService]);
const demoService = useService(DemoService);

const component1 = useService(CURRENT_COMPONENT);
const component2 = getCurrentInstance();

defineExpose({
  demoService,
  component1,
  component2,
});
</script>

<template>
  <div>
    <div class="demo-count">{{ demoService.count }}</div>

    <button
      type="button"
      class="btn-count-demo"
      @click="demoService.increaseCount()"
    >
      Add count demo
    </button>
  </div>

  <div class="child-1-container">
    <div class="child-1-wrapper">
      <ChildComp />
    </div>
  </div>

  <div class="child-2-container">
    <div class="child-2-wrapper">
      <div class="child-2-box">
        <ChildComp />
      </div>
    </div>
  </div>
</template>
