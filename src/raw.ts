import { markRaw } from 'vue';

// TC39 Stage 3 属性装饰器：标记属性永远保持原始对象，不被 Vue 转为响应式
// 使用方式：@Raw()（必须带括号调用，与 @Computed() 保持一致）
//
// 应用场景：
// 当实例被 reactive() 包裹后，默认所有属性都会被递归转为响应式对象。
// 对于复杂的第三方 SDK 对象（如 ECharts 实例、Monaco Editor 实例等），
// 转为响应式会导致性能问题甚至功能异常。
// 使用 @Raw() 装饰的属性，无论初始值还是后续赋值，都会自动调用 markRaw，
// 确保该属性值永远不会被 Vue 的响应式系统代理。
//
// 实现策略：
// 通过 context.addInitializer 在实例创建时，使用 Object.defineProperty
// 将目标属性替换为带有 getter/setter 的访问器属性。
// setter 中对每次赋值的新值调用 markRaw，确保值始终为原始对象。
export function Raw(): (
  value: undefined,
  context: ClassFieldDecoratorContext
) => (this: any, initialValue: unknown) => unknown {
  return function (
    _value: undefined,
    context: ClassFieldDecoratorContext
  ): (this: any, initialValue: unknown) => unknown {
    const propertyName = context.name;

    context.addInitializer(function (this: any) {
      const cacheKey = Symbol.for(`__raw_${String(propertyName)}`);

      Object.defineProperty(this, propertyName, {
        configurable: true,
        enumerable: true,
        get() {
          return this[cacheKey];
        },
        set(newVal: unknown) {
          // 核心：每次赋值都强制 markRaw，确保值永远不被转为响应式
          this[cacheKey] = isMarkRawable(newVal) ? markRaw(newVal) : newVal;
        },
      });
    });

    // 返回 initializer 函数，处理字段的初始值
    return function (this: any, initialValue: unknown): unknown {
      return isMarkRawable(initialValue) ? markRaw(initialValue) : initialValue;
    };
  };
}

// markRaw 只能作用于对象类型，对原始类型（string、number 等）调用会报错
function isMarkRawable(val: unknown): val is object {
  return val !== null && typeof val === 'object';
}
