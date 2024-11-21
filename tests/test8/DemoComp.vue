<script setup lang="ts">
import { declareProviders, useService } from '../../src/index';
import { DemoService } from './DemoService';
import { OtherService } from './OtherService';

declareProviders([DemoService]);
declareProviders([OtherService]);
const demoService1 = useService(DemoService);
const demoService2 = useService(DemoService);
const otherService1 = useService(OtherService);
const otherService2 = useService(OtherService);

defineExpose({
  demoService1,
  demoService2,
  otherService1,
  otherService2,
});
</script>

<template>
  <div>
    <div class="demo1-count">{{ demoService1.count }}</div>
    <div class="demo2-count">{{ demoService2.count }}</div>
    <div class="other1-count">{{ otherService1.count }}</div>
    <div class="other2-count">{{ otherService2.count }}</div>

    <button
      type="button"
      class="btn-demo1"
      @click="demoService1.increaseCount()"
    >
      Demo1 add count
    </button>

    <button
      type="button"
      class="btn-demo2"
      @click="demoService2.increaseCount()"
    >
      Demo2 add count
    </button>

    <button
      type="button"
      class="btn-other1"
      @click="otherService1.increaseCount()"
    >
      Other1 add count
    </button>

    <button
      type="button"
      class="btn-other2"
      @click="otherService2.increaseCount()"
    >
      Other2 add count
    </button>
  </div>
</template>
