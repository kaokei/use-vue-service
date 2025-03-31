import { computed } from 'vue';
import { TokenType } from '@/index';
import { TYPES } from './token';
import { Inject, PostConstruct } from '@kaokei/di';

export class DemoService {
  public count = 1;
  public age = 100;
  private _name = 'DemoService';
  public computedName: any;

  @Inject(TYPES.OtherService)
  public otherService!: TokenType<typeof TYPES.OtherService>;

  public increaseOtherCount() {
    this.otherService.increaseCount();
  }

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
