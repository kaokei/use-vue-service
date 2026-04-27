import { BaseService } from './BaseService';

/**
 * 中间层服务——继承 BaseService，可以访问父类的 logService。
 * 不需要再次标注 @Injectable()，因为自身没有新增 @Inject。
 */
export class MiddleService extends BaseService {
  public countMiddle = 0;

  public increaseMiddle() {
    this.countMiddle++;
    this.logService.log(`increaseMiddle → countMiddle = ${this.countMiddle}`);
  }
}
