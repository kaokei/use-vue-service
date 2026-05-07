import { Injectable } from '@kaokei/use-vue-service'

@Injectable()
export class ThemeService {
  theme = 'light'

  toggle() {
    this.theme = this.theme === 'light' ? 'dark' : 'light'
  }
}
