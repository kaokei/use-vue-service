import { Injectable } from '@kaokei/use-vue-service'

@Injectable()
export class LoggerService {
  logs: string[] = []

  log(msg: string) {
    this.logs.push(msg)
  }

  clear() {
    this.logs = []
  }
}
