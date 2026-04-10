import { computed, toRaw } from 'vue';
import { getEffectScope } from './scope.ts';

// TC39 Stage 3 getter decorator：将 getter 属性转换为 Vue computed 响应式计算属性
// 使用方式：@Computed()（必须带括号调用）
//
// 实现策略（Plan_A_Lazy — 懒创建）：
// 装饰器返回新的 getter 函数，首次在 Reactive_Proxy 上访问时：
// 1. 通过 getEffectScope(this) 获取或创建 EffectScope
// 2. 在 scope.run() 中调用 computed() 创建 ComputedRef
// 3. 在原始实例上通过 Object.defineProperty 创建同名数据属性，覆盖原型链上的 getter
// 4. 返回 computedRef.value（首次返回值）
// 后续访问时，reactive 代理直接读取数据属性并通过 Auto_Unwrap 自动解包。
//
// setter 支持：如果类上定义了同名的 setter，赋值操作会先触发原型链上的 setter，
// setter 内部修改依赖属性后，ComputedRef 会自动重新计算。
export function Computed(): (
  value: (this: any) => any,
  context: ClassGetterDecoratorContext
) => (this: any) => any {
  return function (
    value: (this: any) => any,
    context: ClassGetterDecoratorContext
  ): (this: any) => any {
    const propertyName = context.name;
    return function (this: any): any {
      // this 在 Reactive_Proxy 上访问时已经是 reactive 代理
      const scope = getEffectScope(this);
      const originalGet = value;
      const computedRef = scope.run(() => computed(() => originalGet.call(this)));
      const raw = toRaw(this);

      // 查找原型链上是否存在同名的 setter
      let originalSet: ((v: any) => void) | undefined;
      let proto = Object.getPrototypeOf(raw);
      while (proto) {
        const desc = Object.getOwnPropertyDescriptor(proto, propertyName);
        if (desc && desc.set) {
          originalSet = desc.set;
          break;
        }
        proto = Object.getPrototypeOf(proto);
      }

      if (originalSet) {
        // 存在 setter：使用 accessor 属性描述符，保留 setter 的同时返回 ComputedRef 的值
        const setter = originalSet;
        Object.defineProperty(raw, propertyName, {
          configurable: true,
          enumerable: true,
          get() {
            return computedRef;
          },
          set(v: any) {
            setter.call(this, v);
          },
        });
      } else {
        // 不存在 setter：使用数据属性描述符，直接存储 ComputedRef
        Object.defineProperty(raw, propertyName, {
          value: computedRef,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }

      // 首次返回值（Auto_Unwrap 会在后续访问中自动解包）
      return computedRef!.value;
    };
  };
}
