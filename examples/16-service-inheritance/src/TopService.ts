import { Injectable, PostConstruct, Computed } from '@kaokei/use-vue-service';
import { MiddleService } from './MiddleService';

/**
 * 顶层服务——继承 MiddleService，新增 @PostConstruct 和 @Computed。
 * 因为自身使用了 @PostConstruct，需要标注 @Injectable()。
 */
@Injectable()
export class TopService extends MiddleService {
  public countTop = 0;
  public label = 'TopService';

  @Computed
  public get summary(): string {
    return `${this.label} | Base:${this.countBase} | Middle:${this.countMiddle} | Top:${this.countTop}`;
  }

  public increaseTop() {
    this.countTop++;
    this.logService.log(`increaseTop → countTop = ${this.countTop}`);
  }

  @PostConstruct()
  public init() {
    this.logService.log('TopService @PostConstruct 执行：依赖注入已完成');
  }
}
