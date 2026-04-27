<script setup lang="ts">
import { SharedService } from './SharedService';
import { declareProviders, useService, useAppService } from '@/index';
import { inject } from 'vue';
import type { App } from 'vue';

// 接收 app 实例（由根组件通过 provide 传入）
const app = inject<App>('app')!;

// comp3 自己也绑定一份 SharedService
declareProviders([SharedService]);

const serviceFromComponent = useService(SharedService);
const serviceFromApp = useAppService(SharedService, app);

defineExpose({
  serviceFromComponent,
  serviceFromApp,
});
</script>

<template>
  <div />
</template>
