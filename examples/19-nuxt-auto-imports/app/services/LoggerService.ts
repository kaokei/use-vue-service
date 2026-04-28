// 无需 import — @kaokei/nuxt-use-vue-service 自动导入 Injectable
@Injectable()
export class LoggerService {
  public log(...msg: any[]) {
    console.log('[LoggerService]', ...msg);
  }
}
