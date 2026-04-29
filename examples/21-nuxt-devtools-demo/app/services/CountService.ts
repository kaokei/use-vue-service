import { Injectable, Computed } from '@kaokei/use-vue-service'
import { ref } from 'vue'

@Injectable()
export class CountService {
  count = ref(0)

  @Computed()
  get doubled() {
    return this.count.value * 2
  }

  increment() {
    this.count.value++
  }

  decrement() {
    this.count.value--
  }

  reset() {
    this.count.value = 0
  }
}
