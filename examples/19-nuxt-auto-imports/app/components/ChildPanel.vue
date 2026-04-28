<script setup lang="ts">
import { ChildService } from '~/services/ChildService'

// declareProviders、useService 无需 import，由插件自动导入
declareProviders([ChildService])
const childService = useService(ChildService)
</script>

<template>
  <div style="border: 1px dashed #999; padding: 12px; margin-top: 8px; border-radius: 4px">
    <strong>子组件独立容器</strong>
    <p>{{ childService.name }}：{{ childService.message }}</p>
  </div>
</template>
