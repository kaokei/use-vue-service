<script setup lang="ts">
import { DemoService } from './DemoService';
import { declareProviders, useService } from '../src/index';

defineProps({
  msg: String,
});

declareProviders([DemoService]);

const service = useService(DemoService);

console.log('DemoService => ', service);
</script>

<template>
  <div>
    <div class="msg">{{ msg }}</div>
    <div class="name">{{ service.name }}</div>
    <div class="age">{{ service.age }}</div>
  </div>
</template>
