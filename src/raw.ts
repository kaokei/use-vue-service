import { ensureRaw } from './utils.ts';

// TC39 Stage 3 装饰器：标记属性永远保持原始对象，不被 Vue 转为响应式
//
// 同时支持两种用法：
//   @Raw() x = {}              — 普通 field 装饰器
//   @Raw() accessor x = {}     — auto-accessor 装饰器
//
// 应用场景：
// 当实例被 reactive() 包裹后，默认所有属性都会被递归转为响应式对象。
// 对于复杂的第三方 SDK 对象（如 ECharts 实例、Monaco Editor 实例等），
// 转为响应式会导致性能问题甚至功能异常。
// 使用 @Raw() 装饰的属性，无论初始值还是后续赋值，都会自动调用 markRaw，
// 确保该属性值永远不会被 Vue 的响应式系统代理。

/**
 * Raw 装饰器的实际实现，提取为模块级函数避免每次调用 Raw() 时重复创建
 */
function rawDecorator(value: any, context: ClassFieldDecoratorContext | ClassAccessorDecoratorContext) {
  if (context.kind === 'accessor') {
    // auto-accessor 装饰器：返回 { get, set, init } 拦截读写和初始化
    const { get, set } = value as ClassAccessorDecoratorResult<unknown, unknown>;
    return {
      get() {
        return get!.call(this);
      },
      set(newVal: unknown) {
        set!.call(this, ensureRaw(newVal));
      },
      init: ensureRaw,
    };
  }

  // field 装饰器：通过 addInitializer + defineProperty 拦截后续赋值
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
        this[cacheKey] = ensureRaw(newVal);
      },
    });
  });

  // 返回 initializer 函数，处理字段的初始值
  return ensureRaw;
}

export function Raw() {
  return rawDecorator;
}
