<script setup lang="ts">
import { NotificationService } from '~/services/NotificationService'

declareProviders([NotificationService])

const notif = useService(NotificationService)

const typeColors: Record<string, string> = {
  success: '#f0fdf4',
  error: '#fef2f2',
  warning: '#fffbeb',
  info: '#eff6ff',
}

const typeBorders: Record<string, string> = {
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString()
}
</script>

<template>
  <div style="max-width: 640px;">
    <h1>🔔 通知队列服务示例</h1>
    <p style="color: #666;">
      演示 NotificationService：消息队列管理、超时自动清除、@Computed 状态派生、@PreDestroy 生命周期清理。
    </p>

    <!-- 触发按钮 -->
    <section style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 6px;">
      <h2>触发通知</h2>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button @click="notif.success('操作成功', '数据已保存')" style="background: #22c55e; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
          成功通知
        </button>
        <button @click="notif.error('操作失败', '网络异常，请稍后重试')" style="background: #ef4444; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
          错误通知
        </button>
        <button @click="notif.warning('请注意', '数据即将过期')" style="background: #f59e0b; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
          警告通知
        </button>
        <button @click="notif.info('提示信息', '系统维护中')" style="background: #3b82f6; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
          信息通知
        </button>
      </div>
      <button
        v-if="notif.hasNotifications"
        @click="notif.clearAll()"
        style="margin-top: 12px; display: block;"
      >
        清空全部 ({{ notif.visibleCount }})
      </button>
    </section>

    <!-- 通知展示区 -->
    <section style="margin-top: 16px;">
      <h2>
        当前通知
        <span style="font-weight: normal; color: #999; font-size: 14px;" v-if="notif.notifications.length === 0">
          （暂无通知，点击上方按钮触发）
        </span>
      </h2>
      <div
        v-for="item in notif.notifications"
        :key="item.id"
        :style="{
          padding: '12px 16px',
          marginBottom: '8px',
          borderRadius: '6px',
          border: `1px solid ${typeBorders[item.type]}`,
          background: typeColors[item.type],
          position: 'relative',
        }"
      >
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <strong>{{ item.title }}</strong>
            <p v-if="item.message" style="margin: 4px 0 0; color: #666;">{{ item.message }}</p>
            <span style="font-size: 12px; color: #999;">{{ formatTime(item.createdAt) }}</span>
          </div>
          <button @click="notif.dismiss(item.id)" style="border: none; background: none; font-size: 18px; cursor: pointer; padding: 0 4px;">
            ×
          </button>
        </div>
      </div>
    </section>

    <!-- 实现要点 -->
    <section style="margin-top: 24px; padding: 16px; background: #e8f5e9; border-radius: 6px; font-size: 14px; color: #555;">
      <strong>💡 实现要点：</strong>
      <ul style="margin: 8px 0 0; padding-left: 20px;">
        <li>通知数组是响应式的 — <code>push</code>/<code>splice</code> 自动触发模板更新</li>
        <li><code>@Computed()</code> 派生 <code>visibleCount</code> 和 <code>hasNotifications</code></li>
        <li>每条通知默认 3 秒后通过 <code>setTimeout</code> 自动移除</li>
        <li><code>@PreDestroy()</code> 在组件销毁时自动清理所有定时器，防止内存泄漏</li>
      </ul>
    </section>
  </div>
</template>
