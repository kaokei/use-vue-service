import { computed, isRef } from 'vue';

/**
 * 用于测试 computed 在不同场景下的行为差异。
 *
 * 场景一：computedX —— 在构造时将 computed 赋值给普通属性
 * 场景二：getComputedX —— 在 getter 中每次调用 computed()
 * 场景三：getX —— 普通 getter（非 computed）
 *
 * 额外测试：类内部通过 this 访问这些属性时，是否会自动解包？
 */
export class DemoService {
  public x = 1;

  // 场景一：构造时创建 computed 并赋值给属性
  public computedX = computed(() => this.x);

  // 场景二：getter 中每次返回新的 computed
  get getComputedX() {
    return computed(() => this.x);
  }

  // 场景三：普通 getter（非 computed）
  get getX() {
    return this.x;
  }

  public increaseX() {
    this.x++;
  }

  /**
   * 在类内部通过 this 访问各属性，返回是否为 Ref 以及实际值。
   * 用于验证：当实例被 reactive 包装后，类内部的 this 访问是否会自动解包。
   */
  public inspectInternalAccess() {
    return {
      // this.x：普通属性
      x_value: this.x,
      x_isRef: isRef(this.x),

      // this.computedX：属性上存储的 ComputedRef
      computedX_value: this.computedX,
      computedX_isRef: isRef(this.computedX),

      // this.getComputedX：getter 返回的 ComputedRef
      getComputedX_value: this.getComputedX,
      getComputedX_isRef: isRef(this.getComputedX),

      // this.getX：普通 getter 返回值
      getX_value: this.getX,
      getX_isRef: isRef(this.getX),
    };
  }
}
