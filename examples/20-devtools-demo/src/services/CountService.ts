import { Injectable } from '@kaokei/use-vue-service'

@Injectable()
export class CountService {
  count = 0

  increment() {
    this.count++
  }

  decrement() {
    this.count--
  }
}
