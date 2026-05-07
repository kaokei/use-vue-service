import { Injectable } from '@kaokei/use-vue-service'

@Injectable()
export class AuthService {
  isLoggedIn = false
  username = ''

  login(name: string) {
    this.isLoggedIn = true
    this.username = name
  }

  logout() {
    this.isLoggedIn = false
    this.username = ''
  }
}
