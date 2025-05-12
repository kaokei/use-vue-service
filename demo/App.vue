<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Demo1Comp from './components/demo1/DemoComp.vue';

const dcRef = ref();

onMounted(() => {
  console.log(
    'dcRef.value.inst.type === DemoComp1 => ',
    dcRef.value.inst.type === Demo1Comp
  );
  console.log('dcRef.value => ', dcRef.value);
  console.log('dcRef.value.inst => ', dcRef.value.inst);
  console.log('DemoComp1 => ', Demo1Comp);
});
</script>

<template>
  <Demo1Comp ref="dcRef" msg="Vite + Vue" />
</template>
