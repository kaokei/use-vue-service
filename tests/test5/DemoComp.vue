<script setup lang="ts">
import { DemoService } from './DemoService';
import { OtherService } from './OtherService';
import { declareProviders, useService } from '../../src/inversify';
import { TYPES } from './token';

defineProps({
  msg: String,
});

declareProviders(con => {
  con.bind(TYPES.DemoService).to(DemoService);
  con.bind(TYPES.OtherService).to(OtherService);
});
const service = useService(TYPES.DemoService);

defineExpose({
  service,
});
</script>

<template>
  <div>
    <div class="msg">{{ msg }}</div>
    <div class="count">{{ service.count }}</div>
    <div class="other-count">{{ service.otherService.count }}</div>
    <div class="age">{{ service.age }}</div>
    <div class="name">{{ service.name }}</div>
    <div class="computedName">{{ service.computedName }}</div>

    <button type="button" class="btn-age" @click="service.increaseAge()">
      Add age
    </button>
    <button type="button" class="btn-count" @click="service.increaseCount()">
      Add count
    </button>
    <button type="button" class="btn-other-count" @click="service.increaseOtherCount()">
      Add other count
    </button>
  </div>
</template>
