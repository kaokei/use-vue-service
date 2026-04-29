import { Injectable } from '@kaokei/use-vue-service'
import { ref } from 'vue'

@Injectable()
export class UserService {
  name = ref('张三')
  role = ref('admin')

  setName(name: string) {
    this.name.value = name
  }

  toggleRole() {
    this.role.value = this.role.value === 'admin' ? 'guest' : 'admin'
  }
}
