import { Injectable } from '@kaokei/use-vue-service'
import { ref } from 'vue'

@Injectable()
export class CountService {
  count = ref(0)

  increment() {
    this.count.value++
  }

  decrement() {
    this.count.value--
  }
}
