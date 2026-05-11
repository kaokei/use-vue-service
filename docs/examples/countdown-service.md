# 倒计时服务 — 组件级独立实例与生命周期管理

## 场景描述

多个倒计时组件在页面中同时运行，每个组件需要独立的倒计时实例，互不干扰。组件卸载时自动清除定时器，防止内存泄漏。

## 设计原则

- **组件级服务** — 每个组件内部调用 `declareProviders([CountdownService])`，获得**完全独立**的服务实例
- **@PreDestroy 自动清理** — 组件卸载时自动调用 `dispose()` 清除定时器，无需手动管理
- **不同展现方式共享同一 Service** — `CountdownText`（行内文本）和 `CountdownBlocks`（卡片数字）使用同一个 `CountdownService` 类

## 服务定义

```ts
import { Injectable, PreDestroy, autobind } from '@kaokei/use-vue-service'

@Injectable()
export class CountdownService {
  // 实例被 reactive() 包裹，普通属性即为响应式
  totalSeconds = 0
  day = 0
  hour = 0
  minute = 0
  second = 0
  millisecond = 0

  private step = 100
  private startTimestamp = 0
  private timer: number | null = null

  init(totalSeconds: number, step = 100): void {
    this.totalSeconds = totalSeconds
    this.step = step
    this.day = 0
    this.hour = 0
    this.minute = 0
    this.second = 0
    this.millisecond = 0
    this.startTimestamp = Date.now()
    this.tick()
  }

  @autobind
  private tick(): void {
    const elapsed = Date.now() - this.startTimestamp
    let remaining = this.totalSeconds * 1000 - elapsed
    if (remaining < 0) remaining = 0

    const ms = remaining % 1000
    this.millisecond = Math.floor(ms / 100)
    const totalSec = (remaining - ms) / 1000
    this.second = totalSec % 60
    const totalMin = (totalSec - this.second) / 60
    this.minute = totalMin % 60
    const totalHour = (totalMin - this.minute) / 60
    this.hour = totalHour % 24
    this.day = Math.min(99, Math.floor((totalHour - this.hour) / 24))

    if (remaining > 0) {
      this.timer = window.setTimeout(this.tick, this.step)
    }
  }

  @PreDestroy()
  dispose(): void {
    if (this.timer !== null) {
      window.clearTimeout(this.timer)
      this.timer = null
    }
  }
}
```

## 组件使用

### 文本样式（CountdownText）

```vue
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
```

### 卡片样式（CountdownBlocks）

```vue
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
```

### 页面中使用多个倒计时

```vue
<template>
  <div>
    <!-- 文本样式：不同结束时间，各自独立 -->
    <CountdownText :total-seconds="90" label="90 秒" />
    <CountdownText :total-seconds="3600" label="1 小时" />

    <!-- 卡片样式：多个实例互不干扰 -->
    <CountdownBlocks :total-seconds="120" label="活动 A（2分钟）" />
    <CountdownBlocks :total-seconds="3661" label="活动 B（1小时1分1秒）" />

    <!-- 混合：文本+卡片共用不同服务实例 -->
    <CountdownText :total-seconds="180" label="抢购" />
    <CountdownBlocks :total-seconds="180" label="同一时长" />
  </div>
</template>
```

## 关键要点

1. **组件级作用域** — 每个组件内部调用 `declareProviders([CountdownService])` 获得独立的服务实例，多个倒计时组件之间互不干扰。
2. **@PreDestroy 自动清理** — 组件卸载时框架自动调用 `dispose()` 方法清除 `setTimeout`，不会出现定时器泄漏。无需手动在 `onUnmounted` 中清理。
3. **@autobind + setTimeout** — `tick()` 使用 `@autobind` 装饰器绑定 `this`，使得 `window.setTimeout(this.tick, this.step)` 可以直接传递方法引用而无需箭头函数包裹，同时保持 `this` 指向 reactive proxy，响应式正常工作。
4. **基于时间戳而非递减计数** — `tick()` 通过 `Date.now() - startTimestamp` 计算剩余时间，比每次 `totalSeconds--` 更精确，不受定时器精度偏差影响。
5. **同一 Service 类，两种展现方式** — `CountdownText` 和 `CountdownBlocks` 使用完全相同的 `CountdownService`，只是模板渲染方式不同。服务层和视图层解耦。
