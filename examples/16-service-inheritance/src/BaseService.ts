import { Inject, Injectable } from '@kaokei/use-vue-service';
import { LogService } from './LogService';

/**
 * 基础服务——继承链的底层，通过 @Inject 注入 LogService。
 * 子类可以通过 this.logService 访问注入的依赖。
 */
@Injectable()
export class BaseService {
  public countBase = 0;

  @Inject(LogService)
  public logService!: LogService;

  public increaseBase() {
    this.countBase++;
    this.logService.log(`increaseBase → countBase = ${this.countBase}`);
  }
}
