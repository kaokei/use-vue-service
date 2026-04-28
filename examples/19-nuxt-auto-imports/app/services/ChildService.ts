// 无需 import — Injectable 由插件自动导入
@Injectable()
export class ChildService {
  public name = 'ChildService'
  public message = '我是子组件的独立服务实例'
}
