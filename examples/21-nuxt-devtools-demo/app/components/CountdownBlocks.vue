<script setup lang="ts">
import { onMounted } from 'vue'
import { CountdownService } from '~/services/CountdownService'

const props = defineProps<{
  totalSeconds: number
  label?: string
}>()

// 每个组件实例拥有独立的 CountdownService
declareProviders([CountdownService])
const cd = useService(CountdownService)

onMounted(() => {
  cd.init(props.totalSeconds)
})

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

const blocks = [
  { key: 'day' as const, label: '天', show: () => cd.day > 0 },
  { key: 'hour' as const, label: '时' },
  { key: 'minute' as const, label: '分' },
  { key: 'second' as const, label: '秒' },
]
</script>

<template>
  <div style="display: inline-flex; flex-direction: column; align-items: center; gap: 4px;">
    <span v-if="label" style="font-size: 14px; color: #999;">{{ label }}</span>
    <div style="display: flex; gap: 6px;">
      <template v-for="block in blocks" :key="block.key">
        <template v-if="!block.show || block.show()">
          <div style="display: flex; flex-direction: column; align-items: center;">
            <span style="
              background: #1a1a2e;
              color: #00ff88;
              font-family: monospace;
              font-size: 28px;
              font-weight: 700;
              padding: 4px 10px;
              border-radius: 6px;
              min-width: 52px;
              text-align: center;
            ">
              {{ pad(cd[block.key]) }}
            </span>
            <span style="font-size: 12px; color: #999; margin-top: 2px;">{{ block.label }}</span>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>
