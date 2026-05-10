import { Injectable, Computed, PreDestroy } from '@kaokei/use-vue-service'

type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  createdAt: number
}

@Injectable()
export class NotificationService {
  // 实例被 reactive() 包裹，普通属性即为响应式，无需 ref()
  notifications: Notification[] = []

  defaultDuration = 3000
  maxVisible = 5

  private timers: Set<ReturnType<typeof setTimeout>> = new Set()

  @Computed()
  get visibleCount(): number {
    return this.notifications.length
  }

  @Computed()
  get hasNotifications(): boolean {
    return this.notifications.length > 0
  }

  success(title: string, message = ''): string {
    return this.add('success', title, message)
  }

  error(title: string, message = ''): string {
    return this.add('error', title, message)
  }

  warning(title: string, message = ''): string {
    return this.add('warning', title, message)
  }

  info(title: string, message = ''): string {
    return this.add('info', title, message)
  }

  dismiss(id: string): void {
    const index = this.notifications.findIndex(n => n.id === id)
    if (index !== -1) {
      this.notifications.splice(index, 1)
    }
  }

  clearAll(): void {
    for (const timer of this.timers) {
      clearTimeout(timer)
    }
    this.timers.clear()
    this.notifications.splice(0, this.notifications.length)
  }

  @PreDestroy()
  dispose(): void {
    for (const timer of this.timers) {
      clearTimeout(timer)
    }
    this.timers.clear()
  }

  private add(type: NotificationType, title: string, message: string, duration?: number): string {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}`

    while (this.notifications.length >= this.maxVisible) {
      this.notifications.shift()
    }

    this.notifications.push({
      id,
      type,
      title,
      message,
      createdAt: Date.now(),
    })

    const timer = setTimeout(() => {
      this.dismiss(id)
      this.timers.delete(timer)
    }, duration ?? this.defaultDuration)

    this.timers.add(timer)
    return id
  }
}
