/**
 * 应用配置服务
 *
 * 一个简单的 App 级服务，存储应用名称和版本号。
 * 通过 declareAppProvidersPlugin 以 Vue 插件形式注册到 App 级容器中，
 * 所有组件都可以通过 useService 获取同一个实例。
 */
export class AppConfigService {
  /** 应用名称 */
  public appName = 'My App';

  /** 应用版本号 */
  public version = '1.0.0';
}
