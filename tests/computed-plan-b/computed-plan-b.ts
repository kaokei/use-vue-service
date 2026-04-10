import { computed, toRaw } from 'vue';
import { getEffectScope } from '@/scope.ts';

// Plan_B（返回新 getter 函数策略）：
// 装饰器返回一个新的 getter 函数替换原始 getter。
// 新 getter 内部使用局部 Symbol 作为缓存 key：
// 1. 首次调用时，通过 getEffectScope(this) 获取或创建 EffectScope
// 2. 在 scope.run() 中调用 computed() 创建 ComputedRef
// 3. 将 ComputedRef 缓存到原始对象（toRaw(this)）的 Symbol key 上
//    注意：必须在原始对象上缓存，而非 reactive 代理上，
//    因为 reactive 代理会对 Ref/ComputedRef 进行 Auto_Unwrap，
//    导致后续读取 this[sym] 时拿到的是解包后的原始值而非 ComputedRef 对象
// 4. 后续调用直接从原始对象读取缓存的 ComputedRef 并返回 .value
// 不依赖 Auto_Unwrap 机制，手动返回 computedRef.value。
export function ComputedPlanB(): (
  value: (this: any) => any,
  context: ClassGetterDecoratorContext
) => (this: any) => any {
  return function (
    value: (this: any) => any,
    context: ClassGetterDecoratorContext
  ): (this: any) => any {
    const propertyName = context.name;
    // 使用局部 Symbol()（非 Symbol.for()），避免全局污染
    // 描述包含属性名，方便调试
    const sym = Symbol(`__computed__${String(propertyName)}`);

    return function (this: any): any {
      // 从原始对象上读取缓存，避免 reactive 代理的 Auto_Unwrap 干扰
      const raw = toRaw(this);
      let cached = raw[sym];
      if (!cached) {
        // this 在 Reactive_Proxy 上访问时已经是 reactive 代理，响应式追踪正确
        const scope = getEffectScope(this);
        const originalGet = value;
        const computedRef = scope.run(() => computed(() => originalGet.call(this)));
        // 缓存到原始对象上，确保后续读取时拿到的是 ComputedRef 对象本身
        raw[sym] = computedRef;
        cached = computedRef;
      }
      // 手动返回 computedRef.value（不依赖 Auto_Unwrap）
      return cached.value;
    };
  };
}
