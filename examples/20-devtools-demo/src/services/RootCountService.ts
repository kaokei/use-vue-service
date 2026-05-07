import { Token, Injectable } from '@kaokei/use-vue-service'

@Injectable()
export class RootCountService {
  count = 0

  increment() {
    this.count++
  }

  decrement() {
    this.count--
  }
}

export const ROOT_COUNT_TOKEN = new Token<RootCountService>('RootCountService')