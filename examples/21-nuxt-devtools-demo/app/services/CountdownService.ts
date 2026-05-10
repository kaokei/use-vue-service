import { Injectable, PreDestroy } from '@kaokei/use-vue-service'

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
      this.timer = window.setTimeout(() => this.tick(), this.step)
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
