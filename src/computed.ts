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
// setter 支持：如果原型链上存在同名 setter，使用 writable computed（computed({ get, set })）。
// 赋值时 reactive 的 Auto_Unwrap 会调用 computedRef.value = val，
// 触发 writable computed 的 set 回调，进而调用原始 setter。

/**
 * 沿原型链查找指定属性的 setter
 * 提取为顶层函数，避免装饰器每次调用时重复创建
 */
function findProtoSetter(
  raw: object,
  propertyName: PropertyKey
): ((v: any) => void) | undefined {
  let proto = Object.getPrototypeOf(raw);
  while (proto) {
    const desc = Object.getOwnPropertyDescriptor(proto, propertyName);
    if (desc && desc.set) {
      return desc.set;
    }
    proto = Object.getPrototypeOf(proto);
  }
  return undefined;
}

/**
 * 在原始实例上定义数据属性来存储 ComputedRef
 * reactive 的 Auto_Unwrap 会自动处理读取（返回 .value）和写入（调用 .value = val）
 */
function defineComputedProperty(
  raw: object,
  propertyName: PropertyKey,
  computedRef: any
): void {
  Object.defineProperty(raw, propertyName, {
    value: computedRef,
    writable: true,
    configurable: true,
    enumerable: true,
  });
}

/**
 * Computed 装饰器的实际实现，提取为模块级函数避免每次调用 Computed() 时重复创建
 */
function computedDecorator(
  value: (this: any) => any,
  context: ClassGetterDecoratorContext
): (this: any) => any {
  const propertyName = context.name;
  return function (this: any): any {
    // this 在 Reactive_Proxy 上访问时已经是 reactive 代理
    const scope = getEffectScope(this);
    const originalGet = value;
    const raw = toRaw(this);

    const originalSet = findProtoSetter(raw, propertyName);

    // 根据是否存在 setter 创建只读或可写的 computed
    const that = this;
    const computedRef = originalSet
      ? scope.run(() => {
          const setter = originalSet!;
          return computed({
            get: () => originalGet.call(that),
            set: (v: any) => setter.call(that, v),
          });
        })
      : scope.run(() => computed(() => originalGet.call(that)));

    defineComputedProperty(raw, propertyName, computedRef);

    // 首次返回值
    return computedRef!.value;
  };
}

export function Computed(): (
  value: (this: any) => any,
  context: ClassGetterDecoratorContext
) => (this: any) => any {
  return computedDecorator;
}
