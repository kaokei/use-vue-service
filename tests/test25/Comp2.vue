<script setup lang="ts">
import { SharedService } from './SharedService';
import { declareProviders } from '@/index';
import Comp3 from './Comp3.vue';

// comp2 绑定一份 SharedService
declareProviders([SharedService]);
</script>

<template>
  <Comp3 ref="comp3" />
</template>
