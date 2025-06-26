import { PostConstruct } from '@/index';
import { computed } from 'vue';

export class DemoService {
  public count = 1;
  public age = 100;
  private _name = 'DemoService';
  public computedName: any;

  private componentMsg = '';

  public setComponentMsg(msg: string) {
    this.componentMsg = msg;
  }

  public increaseCount() {
    this.count++;
  }

  public increaseAge() {
    this.age++;
  }

  public get name() {
    return `${this.componentMsg}-${this._name}-${this.age}`;
  }

  @PostConstruct()
  public init() {
    this.computedName = computed(() => {
      return `${this.componentMsg}-${this._name}-${this.age}`;
    });
  }
}
