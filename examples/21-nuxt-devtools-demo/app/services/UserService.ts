import { Injectable } from '@kaokei/use-vue-service'

@Injectable()
export class UserService {
  // 实例被 reactive() 包裹，普通属性即为响应式，无需 ref()
  name = '张三'
  role = 'admin'

  setName(name: string) {
    this.name = name
  }

  toggleRole() {
    this.role = this.role === 'admin' ? 'guest' : 'admin'
  }
}
