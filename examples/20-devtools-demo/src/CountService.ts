import { Injectable } from '@kaokei/use-vue-service'

@Injectable()
export class CountService {
  // 实例被 reactive() 包裹，普通属性即为响应式，无需 ref()
  count = 0

  increment() {
    this.count++
  }

  decrement() {
    this.count--
  }
}
