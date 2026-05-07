import { Injectable } from '@kaokei/use-vue-service'

@Injectable()
export class UserService {
  name = '张三'
  role = 'admin'

  setName(name: string) {
    this.name = name
  }
}
