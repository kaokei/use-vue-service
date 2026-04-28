// 无需 import — Injectable、Raw 均由插件自动导入
@Injectable()
export class ThemeService {
  // @Raw 声明非响应式属性（不会触发 Vue 响应式追踪）
  @Raw
  public config = { version: '1.0.0', author: 'kaokei' }

  public theme = 'light'

  public toggle() {
    this.theme = this.theme === 'light' ? 'dark' : 'light'
  }
}
