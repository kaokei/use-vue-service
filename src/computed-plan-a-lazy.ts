import { computed, toRaw } from 'vue';
import { getEffectScope } from './scope.ts';

// Plan_A_Lazy（懒创建策略）：
// 装饰器返回新的 getter 函数，首次在 Reactive_Proxy 上访问时：
// 1. 通过 getEffectScope(this) 获取或创建 EffectScope
// 2. 在 scope.run() 中调用 computed() 创建 ComputedRef
// 3. 在原始实例上通过 Object.defineProperty 创建同名数据属性，覆盖原型链上的 getter
// 4. 返回 computedRef.value（首次返回值）
// 后续访问时，reactive 代理直接读取数据属性并通过 Auto_Unwrap 自动解包。
export function ComputedPlanALazy(): (
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
      // 获取原始对象，通过 Object.defineProperty 在原始实例上创建同名数据属性
      // 直接赋值会因为原型链上只有 getter 没有 setter 而报错
      const raw = toRaw(this);
      Object.defineProperty(raw, propertyName, {
        value: computedRef,
        writable: true,
        configurable: true,
        enumerable: true,
      });
      // 首次返回值（Auto_Unwrap 会在后续访问中自动解包）
      return computedRef!.value;
    };
  };
}
