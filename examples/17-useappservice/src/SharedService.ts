/**
 * 共享服务——在 App 级和组件级各自绑定一份，
 * 用于演示 useAppService 与 useService 获取的是不同实例。
 */
export class SharedService {
  public name = '';
  public count = 0;

  public increaseCount() {
    this.count++;
  }
}
