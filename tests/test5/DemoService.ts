import { computed } from 'vue';
import { postReactive } from '../../src/index';
import { TYPES } from './token';
import { inject } from 'inversify';

export class DemoService {
  public count = 1;
  public age = 100;
  private _name = 'DemoService';
  public computedName: any;

  @inject(TYPES.OtherService)
  public otherService: any;

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

  @postReactive()
  public init() {
    this.computedName = computed(() => {
      return `${this._name}-${this.age}`;
    });
  }
}