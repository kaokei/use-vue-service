<script setup lang="ts">
import { ref } from 'vue';
import { declareProviders, useService } from '@/index';
import { DemoService } from './DemoService';

defineProps<{ msg: string }>();

declareProviders([DemoService]);

const count = ref(0);

const service = useService(DemoService);
</script>

<template>
  <div>
    <h1>{{ msg }}</h1>

    <div>
      <button type="button" @click="count++">count is {{ count }}</button>
    </div>

    <div class="my-4">
      <button type="button" @click="service.increaseAge">
        service age is {{ service.age }}
      </button>
      <div>sumage => {{ service.sumage }}</div>
      <div>computedsumage => {{ service.computedsumage }}</div>
    </div>

    <div class="my-4">
      <button type="button" @click="service.changeName">
        service name is {{ service.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.my-4 {
  margin: 24px 0;
}
</style>
