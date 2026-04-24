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
 * Computed 装饰器的实际实现，提取为模块级函数避免每次调用 Computed() 时重复创建
 */
function computedDecorator(
  value: (this: any) => any,
  context: ClassGetterDecoratorContext
): (this: any) => any {
  const propertyName = context.name;
  return function (this: any): any {
    // this 在 Reactive_Proxy 上访问时已经是 reactive 代理
    const that = this;
    const raw = toRaw(this);
    const scope = getEffectScope(raw);
    const originalGet = value;

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

    // 根据是否存在 setter 创建只读或可写的 computed
    const computedRef = originalSet
      ? scope.run(() =>
          computed({
            get: () => originalGet.call(that),
            set: (v: any) => originalSet.call(that, v),
          })
        )
      : scope.run(() => computed(() => originalGet.call(that)));

    // 在原始实例上定义数据属性来存储 ComputedRef
    // reactive 的 Auto_Unwrap 会自动处理读取（返回 .value）和写入（调用 .value = val）
    Object.defineProperty(raw, propertyName, {
      value: computedRef,
      writable: true,
      configurable: true,
      enumerable: true,
    });

    // 首次返回值
    return computedRef!.value;
  };
}

// 重载签名：支持 @Computed 和 @Computed() 两种用法
export function Computed(): (
  value: (this: any) => any,
  context: ClassGetterDecoratorContext
) => (this: any) => any;
export function Computed(
  value: (this: any) => any,
  context: ClassGetterDecoratorContext
): (this: any) => any;
export function Computed(
  value?: (this: any) => any,
  context?: ClassGetterDecoratorContext
): any {
  // 不带括号：@Computed — 直接作为装饰器调用，第一个参数是 getter 函数
  if (typeof value === 'function' && context?.kind === 'getter') {
    return computedDecorator(value, context);
  }
  // 带括号：@Computed() — 作为工厂函数调用，返回装饰器
  return computedDecorator;
}
