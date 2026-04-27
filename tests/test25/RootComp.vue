<script setup lang="ts">
import { provide, getCurrentInstance } from 'vue';
import Comp1 from './Comp1.vue';

// 将 app 实例通过 provide 传递到子孙组件
const instance = getCurrentInstance()!;
provide('app', instance.appContext.app);
</script>

<template>
  <Comp1 ref="comp1" />
</template>
