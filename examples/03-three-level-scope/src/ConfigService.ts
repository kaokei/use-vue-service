/**
 * 配置服务
 *
 * 一个简单的服务类，通过 scope 属性标识当前实例所属的作用域层级。
 * 在三层级作用域示例中，同一个 ConfigService 类会在不同层级被声明，
 * 每个层级通过 FunctionProvider 设置不同的 scope 值，
 * 从而演示组件级覆盖 App 级、App 级覆盖全局根级的层级关系。
 */
export class ConfigService {
  /** 标识当前服务实例所属的作用域层级 */
  public scope = '默认';
}
