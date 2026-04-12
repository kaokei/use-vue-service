import { Computed } from '@kaokei/use-vue-service';

/**
 * 问候服务
 *
 * 演示 @Computed 装饰器在 Nuxt 中的使用
 */
export class GreetingService {
  /** 用户名 */
  public name = 'Nuxt';

  /** 计算属性：根据 name 生成问候语 */
  @Computed
  public get greeting(): string {
    return `你好，${this.name}！欢迎使用 Nuxt 装饰器 🎉`;
  }
}
