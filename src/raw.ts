import { markRaw, toRaw } from 'vue';
import { isObject } from '@kaokei/di';
import { RAW_CLASS_KEY } from './constants.ts';

// TC39 Stage 3 装饰器：标记属性永远保持原始对象，不被 Vue 转为响应式
//
// 支持三种用法：
//   @Raw() x = {}              — field 装饰器：单个属性不转为响应式
//   @Raw() accessor x = {}     — auto-accessor 装饰器：单个属性不转为响应式
//   @Raw() class Foo {}        — class 装饰器：整个实例不转为响应式
//
// 应用场景：
// 当实例被 reactive() 包裹后，默认所有属性都会被递归转为响应式对象。
// 对于复杂的第三方 SDK 对象（如 ECharts 实例、Monaco Editor 实例等），
// 转为响应式会导致性能问题甚至功能异常。

/**
 * 将值标记为 raw（如果是对象则调用 markRaw，否则原样返回）
 */
export function ensureRaw(val: unknown): unknown {
  return isObject(val) ? markRaw(val) : val;
}

function rawFieldDecorator(
  _value: any,
  context: ClassFieldDecoratorContext
): (initialValue: unknown) => unknown {
  const propertyName = context.name;
  let cachedValue: unknown;

  context.addInitializer(function (this: any) {
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

  // 返回 initializer 函数，将字段初始值通过 ensureRaw 标记
  return (initialValue: unknown) => {
    const ret = ensureRaw(initialValue);
    cachedValue = ret;
    return ret;
  };
}

function rawAccessorDecorator(
  value: ClassAccessorDecoratorTarget<any, any>,
  _context: ClassAccessorDecoratorContext
): ClassAccessorDecoratorResult<any, any> {
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

function rawClassDecorator(_value: any, context: ClassDecoratorContext): void {
  if (context.metadata) {
    context.metadata[RAW_CLASS_KEY] = true;
  }
}

// 重载签名：支持 @Raw 和 @Raw() 两种用法，覆盖 field / accessor / class 三种粒度
export function Raw(): (
  value: any,
  context:
    | ClassFieldDecoratorContext
    | ClassAccessorDecoratorContext
    | ClassDecoratorContext
) => any;
export function Raw(value: any, context: ClassFieldDecoratorContext): void;
export function Raw(
  value: any,
  context: ClassAccessorDecoratorContext
): ClassAccessorDecoratorResult<any, any>;
export function Raw(value: any, context: ClassDecoratorContext): void;
export function Raw(value?: any, context?: any): any {
  if (context?.kind === 'field') return rawFieldDecorator(value, context);
  if (context?.kind === 'accessor') return rawAccessorDecorator(value, context);
  if (context?.kind === 'class') return rawClassDecorator(value, context);
  // 带括号：@Raw() — 作为工厂函数调用，返回装饰器
  return (v: any, ctx: any) => {
    if (ctx?.kind === 'field') return rawFieldDecorator(v, ctx);
    if (ctx?.kind === 'accessor') return rawAccessorDecorator(v, ctx);
    return rawClassDecorator(v, ctx);
  };
}
