import { computed } from 'vue';
import { PostConstruct } from '@/index';
import { DemoServiceParent } from './DemoServiceParent';

export class DemoService extends DemoServiceParent {
  public count = 1;
  public age = 100;
  private _name = 'DemoService';
  public computedName: any;

  public increaseCount() {
    this.count++;
  }

  public increaseAge() {
    this.age++;
  }

  public get name() {
    return `${this._name}-${this.age}`;
  }

  @PostConstruct()
  public init() {
    this.computedName = computed(() => {
      return `${this._name}-${this.age}`;
    });
  }
}
