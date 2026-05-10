# 通知队列服务 — 消息队列与超时自动清除

## 场景描述

全局通知系统：显示成功/错误/警告等消息，消息在指定时间后自动消失，组件卸载时自动清理定时器。

## 服务定义

```ts
import { Injectable, Computed, PreDestroy } from '@kaokei/use-vue-service';

/** 通知类型 */
type NotificationType = 'success' | 'error' | 'warning' | 'info';

/** 单条通知 */
interface Notification {
  /** 唯一标识 */
  id: string;
  /** 通知类型 */
  type: NotificationType;
  /** 标题 */
  title: string;
  /** 通知内容 */
  message: string;
  /** 创建时间戳 */
  createdAt: number;
}

/**
 * 通知队列服务。
 * 
 * 管理全局通知的添加、自动移除和生命周期。
 * 服务实例本身是 Vue reactive 对象，notifications 数组是响应式的。
 */
@Injectable()
export class NotificationService {
  /** 通知队列（响应式数组） */
  notifications: Notification[] = [];

  /** 默认显示时长（毫秒），默认 3 秒 */
  defaultDuration = 3000;

  /** 最大同时显示数量 */
  maxVisible = 5;

  /** 活跃的定时器集合，组件卸载时统一清理 */
  private timers: Set<ReturnType<typeof setTimeout>> = new Set();

  /**
   * 当前可见的通知数量（响应式派生状态）。
   */
  @Computed
  get visibleCount(): number {
    return this.notifications.length;
  }

  /**
   * 是否有通知（响应式派生状态）。
   */
  @Computed
  get hasNotifications(): boolean {
    return this.notifications.length > 0;
  }

  /**
   * 添加一条成功通知。
   */
  success(title: string, message = ''): string {
    return this.add('success', title, message);
  }

  /**
   * 添加一条错误通知。
   */
  error(title: string, message = ''): string {
    return this.add('error', title, message);
  }

  /**
   * 添加一条警告通知。
   */
  warning(title: string, message = ''): string {
    return this.add('warning', title, message);
  }

  /**
   * 添加一条信息通知。
   */
  info(title: string, message = ''): string {
    return this.add('info', title, message);
  }

  /**
   * 立即移除指定通知。
   */
  dismiss(id: string): void {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
    }
  }

  /**
   * 清空所有通知。
   */
  clearAll(): void {
    // 清除所有定时器
    for (const timer of this.timers) {
      clearTimeout(timer);
    }
    this.timers.clear();

    // 清空通知列表
    this.notifications.splice(0, this.notifications.length);
  }

  /**
   * 组件销毁时自动清理所有定时器。
   */
  @PreDestroy()
  dispose(): void {
    for (const timer of this.timers) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }

  /**
   * 核心方法：添加通知并设置自动移除定时器。
   */
  private add(type: NotificationType, title: string, message: string, duration?: number): string {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const notification: Notification = {
      id,
      type,
      title,
      message,
      createdAt: Date.now(),
    };

    // 限制最大数量：移除最早的通知
    while (this.notifications.length >= this.maxVisible) {
      const oldest = this.notifications.shift();
      if (oldest) {
        // 同时清除被移除通知的定时器（如果有的话）
      }
    }

    // 添加到队列
    this.notifications.push(notification);

    // 设置自动移除定时器
    const timer = setTimeout(() => {
      this.dismiss(id);
      this.timers.delete(timer);
    }, duration ?? this.defaultDuration);

    this.timers.add(timer);

    return id;
  }
}
```

## 组件使用

```vue
<script lang="ts" setup>
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { NotificationService } from './notification.service';

// 声明服务为全局服务（使用 declareRootProviders）
// 或者声明为组件级服务（使用 declareProviders）
declareProviders(NotificationService);

// 获取服务实例
const notif = useService(NotificationService);
</script>

<template>
  <div>
    <!-- 触发按钮 -->
    <button @click="notif.success('操作成功', '数据已保存')">
      显示成功通知
    </button>
    <button @click="notif.error('操作失败', '请稍后重试')">
      显示错误通知
    </button>
    <button @click="notif.warning('请注意', '数据即将过期')">
      显示警告通知
    </button>

    <!-- 通知列表（固定在右上角） -->
    <div class="notification-container">
      <TransitionGroup name="notif">
        <div
          v-for="item in notif.notifications"
          :key="item.id"
          :class="['notification', `notification--${item.type}`]"
        >
          <strong>{{ item.title }}</strong>
          <p v-if="item.message">{{ item.message }}</p>
          <button @click="notif.dismiss(item.id)">×</button>
        </div>
      </TransitionGroup>
    </div>

    <!-- 清空按钮 -->
    <button
      v-if="notif.hasNotifications"
      @click="notif.clearAll()"
    >
      清空全部 ({{ notif.visibleCount }})
    </button>
  </div>
</template>

<style scoped>
.notification-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification {
  padding: 12px 16px;
  border-radius: 8px;
  min-width: 280px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: relative;
}

.notification--success { background: #f0fdf4; border: 1px solid #22c55e; }
.notification--error   { background: #fef2f2; border: 1px solid #ef4444; }
.notification--warning { background: #fffbeb; border: 1px solid #f59e0b; }
.notification--info    { background: #eff6ff; border: 1px solid #3b82f6; }
</style>
```

## 关键要点

1. **服务实例是 reactive 对象** — `notifications` 数组的 push/splice 自动触发模板更新。
2. **@Computed 派生状态** — `visibleCount` 和 `hasNotifications` 自动跟随数组变化。
3. **@PreDestroy 生命周期** — `dispose()` 方法在组件/容器销毁时自动调用，清理所有定时器，防止内存泄漏。
4. **数量限制** — 超过 `maxVisible` 时移除最早的通知，保持界面整洁。
5. **自动移除** — 每条通知默认 3 秒后自动消失，可通过参数自定义时长。
