<script setup lang="ts">
import { onMounted } from 'vue'
import { CountdownService } from '~/services/CountdownService'

const props = withDefaults(defineProps<{
  totalSeconds: number
  label?: string
}>(), {
  label: '',
})

// 每个组件实例拥有独立的 CountdownService
declareProviders([CountdownService])
const cd = useService(CountdownService)

onMounted(() => {
  cd.init(props.totalSeconds)
})

function pad(n: number): string {
  return String(n).padStart(2, '0')
}
</script>

<template>
  <div style="display: inline-flex; align-items: center; gap: 4px; font-family: monospace; font-size: 16px;">
    <span v-if="label" style="color: #999; margin-right: 4px;">{{ label }}</span>
    <template v-if="cd.day > 0">
      <span>{{ cd.day }}</span><span style="color: #999;">天</span>
    </template>
    <span>{{ pad(cd.hour) }}</span><span style="color: #999;">:</span>
    <span>{{ pad(cd.minute) }}</span><span style="color: #999;">:</span>
    <span>{{ pad(cd.second) }}</span>
  </div>
</template>
