import { Inject, PostConstruct } from '@/index';
import { computed, ComponentInternalInstance } from 'vue';
import { CURRENT_COMPONENT } from '@/index';

export class DemoService {
  public count = 1;
  public age = 100;
  private _name = 'DemoService';
  public computedName: any;
  @Inject(CURRENT_COMPONENT)
  public component: ComponentInternalInstance | null = null;

  public increaseCount() {
    this.count++;
    this.component?.emit('count', this.count);
  }

  public increaseAge() {
    this.age++;
  }

  public get name() {
    return `${this.component?.props.msg}-${this._name}-${this.age}`;
  }

  @PostConstruct()
  public init() {
    this.computedName = computed(() => {
      return `${this.component?.props.msg}-${this._name}-${this.age}`;
    });
  }
}
