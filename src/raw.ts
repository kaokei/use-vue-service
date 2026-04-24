import { markRaw, toRaw } from 'vue';
import { isObject } from '@kaokei/di';

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
 * 将值标记为 raw（如果是对象则调用 markRaw，否则原样返回）
 */
export function ensureRaw(val: unknown): unknown {
  return isObject(val) ? markRaw(val) : val;
}

/**
 * Raw 装饰器的实际实现，提取为模块级函数避免每次调用 Raw() 时重复创建
 */
function rawDecorator(
  value: any,
  context: ClassFieldDecoratorContext | ClassAccessorDecoratorContext
) {
  if (context.kind === 'accessor') {
    // auto-accessor 装饰器：返回 { get, set, init } 拦截读写和初始化
    return {
      get() {
        return value.get.call(toRaw(this));
      },
      set(newVal: unknown) {
        value.set.call(toRaw(this), ensureRaw(newVal));
      },
      init: ensureRaw,
    };
  }

  // field 装饰器：通过 addInitializer + defineProperty 拦截后续赋值
  // 利用闭包存储值，避免在 this 上挂载额外属性
  const propertyName = context.name;

  context.addInitializer(function (this: any) {
    let cachedValue: unknown;

    Object.defineProperty(this, propertyName, {
      configurable: true,
      enumerable: true,
      get() {
        return cachedValue;
      },
      set(newVal: unknown) {
        cachedValue = ensureRaw(newVal);
      },
    });
  });

}

// 重载签名：支持 @Raw 和 @Raw() 两种用法
export function Raw(): (
  value: any,
  context: ClassFieldDecoratorContext | ClassAccessorDecoratorContext
) => any;
export function Raw(
  value: any,
  context: ClassFieldDecoratorContext | ClassAccessorDecoratorContext
): any;
export function Raw(value?: any, context?: any): any {
  // 不带括号：@Raw — 直接作为装饰器调用，context.kind 为 'field' 或 'accessor'
  if (context?.kind === 'field' || context?.kind === 'accessor') {
    return rawDecorator(value, context);
  }
  // 带括号：@Raw() — 作为工厂函数调用，返回装饰器
  return rawDecorator;
}
