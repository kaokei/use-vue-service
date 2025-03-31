<script setup lang="ts">
import { declareProviders, useService, CURRENT_COMPONENT } from '@/index';
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
      <ChildComp>
        <p>001</p>
        <p>002</p>
        <p>003</p>
      </ChildComp>
    </div>
  </div>

  <div class="child-2-container">
    <div class="child-2-wrapper">
      <div class="child-2-box">
        <ChildComp />
      </div>
    </div>
  </div>

  <div class="child-3-container">
    <Suspense>
      <!-- 具有深层异步依赖的组件 -->
      <ChildComp />

      <!-- 在 #fallback 插槽中显示 “正在加载中” -->
      <template #fallback> Loading... </template>
    </Suspense>
  </div>
</template>
