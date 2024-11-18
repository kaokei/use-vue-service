<script setup lang="ts">
import { useTemplateRef } from 'vue';
import DemoComp from './DemoComp.vue';

const ref = useTemplateRef('demo');

const handleAddAge = () => {
  ref.value?.service.increaseAge();
};
const handleAddCount = () => {
  ref.value?.service.increaseCount();
};

const handleUpdateCount = (count: number) => {
  // ignore
};
</script>

<template>
  <div>
    <DemoComp ref="demo" msg="nihao" @count="handleUpdateCount"></DemoComp>

    <button class="btn-parent-age" type="button" @click="handleAddAge">
      Add age
    </button>

    <button class="btn-parent-count" type="button" @click="handleAddCount">
      Add count
    </button>
  </div>
</template>
