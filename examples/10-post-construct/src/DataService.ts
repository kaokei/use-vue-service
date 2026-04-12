import { Injectable, PostConstruct } from '@kaokei/use-vue-service';

/**
 * 数据服务
 *
 * 演示 @PostConstruct 装饰器的用法。
 * @PostConstruct 标记的方法会在服务实例创建并完成所有依赖注入后自动执行，
 * 无需手动调用，适合用于初始化逻辑。
 */
@Injectable()
export class DataService {
  /** 数据列表，初始为空数组 */
  public data: string[] = [];

  /** 是否已完成初始化 */
  public initialized = false;

  /** 生命周期日志，记录各阶段的执行情况 */
  public logs: string[] = ['constructor: 服务实例已创建'];

  /**
   * 初始化方法
   *
   * 被 @PostConstruct 装饰后，该方法会在实例化完成、依赖注入完毕后自动调用。
   * 不需要在组件中手动调用 init()。
   */
  @PostConstruct
  public init() {
    this.initialized = true;
    this.data = ['苹果', '香蕉', '橙子'];
    this.logs.push('PostConstruct: init() 已自动执行');
  }
}
