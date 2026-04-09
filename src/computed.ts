import { computed, markRaw, reactive } from 'vue';
import { getEffectScope } from './scope.ts';

// TC39 Stage 3 getter decorator：将 getter 属性转换为 Vue computed 响应式计算属性
// 使用方式：@Computed()（必须带括号调用）
export function Computed(): (
  value: Function,
  context: ClassGetterDecoratorContext
) => Function {
  return function (
    value: Function,
    context: ClassGetterDecoratorContext
  ): Function {
    const propertyName = context.name;
    // 每个属性使用独立的 Symbol 作为缓存 key
    const sym = Symbol.for(`__computed__${String(propertyName)}`);

    // 返回新的 getter 函数替换原始 getter
    return function (this: any): any {
      const that = reactive(this);
      let computedRefObj = that[sym];
      if (!computedRefObj) {
        // 通过原型链查找对应的 setter
        let originalSet: ((v: any) => void) | undefined;
        let proto = Object.getPrototypeOf(this);
        while (proto) {
          const desc = Object.getOwnPropertyDescriptor(proto, propertyName);
          if (desc && desc.set) {
            originalSet = desc.set;
            break;
          }
          proto = Object.getPrototypeOf(proto);
        }

        const scope = getEffectScope(that);
        const originalGet = value as (this: any) => any;
        const computedRef = scope.run(() => {
          return computed({
            get: () => originalGet.call(that),
            set: originalSet
              ? (v: any) => originalSet!.call(that, v)
              : undefined as any,
          });
        });
        computedRefObj = markRaw({ value: computedRef });
        that[sym] = computedRefObj;
      }
      return computedRefObj.value.value;
    };
  };
}
