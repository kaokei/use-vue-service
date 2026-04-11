import type { EffectScope as VueEffectScope } from 'vue';
import { effectScope } from 'vue';
import { getEffectScope } from './scope.ts';

/**
 * EffectScope 装饰器的实际实现
 *
 * 每次调用被装饰方法时：
 * 1. 获取或创建实例的 Root_Scope
 * 2. 在 Root_Scope 内创建新的 Child_Scope
 * 3. 在 Child_Scope.run() 中执行原始方法体
 * 4. 返回 Child_Scope 给用户
 *
 * 装饰器内部不维护任何状态，Child_Scope 的生命周期完全由用户管理。
 *
 * @param value - 原始方法
 * @param context - TC39 Stage 3 方法装饰器上下文
 * @returns 包装后的方法，返回 Child_Scope
 */
function effectScopeDecorator(
  value: (this: any, ...args: any[]) => void,
  context: ClassMethodDecoratorContext
): (this: any, ...args: any[]) => VueEffectScope {
  return function (this: any, ...args: any[]): VueEffectScope {
    const rootScope = getEffectScope(this);

    // 每次调用都创建新的 Child_Scope
    const childScope = rootScope.run(() => effectScope())!;

    // 在 Child_Scope 中执行原始方法体
    childScope.run(() => value.call(this, ...args));

    return childScope;
  };
}

// 类型：被装饰方法必须返回 void
type VoidMethod = (this: any, ...args: any[]) => void;

// 重载签名：支持 @EffectScope 和 @EffectScope() 两种用法
export function EffectScope(): (
  value: VoidMethod,
  context: ClassMethodDecoratorContext
) => (this: any, ...args: any[]) => VueEffectScope;
export function EffectScope(
  value: VoidMethod,
  context: ClassMethodDecoratorContext
): (this: any, ...args: any[]) => VueEffectScope;
export function EffectScope(
  value?: VoidMethod,
  context?: ClassMethodDecoratorContext
): any {
  // 不带括号：@EffectScope — 直接作为装饰器调用
  if (typeof value === 'function' && context?.kind === 'method') {
    return effectScopeDecorator(value, context);
  }
  // 带括号：@EffectScope() — 作为工厂函数调用，返回装饰器
  return effectScopeDecorator;
}
