<script setup lang="ts">
import { onMounted, ref } from 'vue';
import DemoComp1 from './components/demo1/DemoComp.vue';

const dcRef = ref();

onMounted(() => {
  console.log(
    'dcRef.value.inst.type === DemoComp1 => ',
    dcRef.value.inst.type === DemoComp1
  );
  console.log('dcRef.value => ', dcRef.value);
  console.log('dcRef.value.inst => ', dcRef.value.inst);
  console.log('DemoComp1 => ', DemoComp1);
});
</script>

<template>
  <DemoComp1 ref="dcRef" msg="Vite + Vue" />
</template>
