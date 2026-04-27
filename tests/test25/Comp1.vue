<script setup lang="ts">
import { SharedService } from './SharedService';
import { declareProviders } from '@/index';
import Comp2 from './Comp2.vue';

// comp1 绑定一份 SharedService
declareProviders([SharedService]);
</script>

<template>
  <Comp2 ref="comp2" />
</template>
