<script setup lang="ts">
import { getCurrentInstance, ref } from 'vue';
import { declareProviders, useService } from '../../../src/index';
import { DemoService } from './DemoService';

defineProps<{ msg: string }>();

declareProviders([DemoService]);

const count = ref(0);

const service = useService(DemoService);

const inst = getCurrentInstance();

defineExpose({
  count,
  service,
  inst,
});
</script>

<template>
  <div>
    <h1>{{ msg }}</h1>

    <div>
      <button type="button" @click="count++">count is {{ count }}</button>
    </div>

    <div>
      <button type="button" @click="service.changeName">
        service name is {{ service.name }}
      </button>
    </div>

    <div>
      <button type="button" @click="service.increaseAge">
        service age is {{ service.age }}
      </button>
    </div>
  </div>
</template>
