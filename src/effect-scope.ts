import type { EffectScope } from 'vue';
import { effectScope } from 'vue';
import { getEffectScope } from './scope.ts';

/**
 * RunInScope 装饰器的实际实现
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
function runInScopeDecorator(
  value: (this: any, ...args: any[]) => void,
  _context: ClassMethodDecoratorContext
): (this: any, ...args: any[]) => EffectScope {
  return function (this: any, ...args: any[]): EffectScope {
    const rootScope = getEffectScope(this);

    // 每次调用都创建新的 Child_Scope
    const childScope = rootScope.run(() => effectScope())!;

    // 在 Child_Scope 中执行原始方法体
    childScope.run(() => value.call(this, ...args));

    return childScope;
  };
}

/**
 * 被装饰方法的类型约束：
 * - 方法体内应返回 void（装饰器会接管返回值）
 * - 但方法签名可以声明返回 EffectScope，以便调用侧获得正确的类型推断
 *
 * 已知限制：
 * TypeScript 装饰器目前无法自动修改被装饰方法的返回类型。
 * 原始方法返回 void，但装饰器在运行时将返回值替换为 EffectScope。
 * 因此调用侧默认推断为 void，无法直接访问 EffectScope 的属性（如 stop()）。
 *
 * 方案 1（推荐）：在调用侧强制类型转换
 * 实际业务中通常只需要调用 stop() 方法来清理副作用，直接在调用侧做类型断言即可：
 * ```ts
 * const scope = reactiveDemo.setup() as any;
 * scope.stop();
 * // 或者更精确的类型转换：
 * const scope = reactiveDemo.setup() as unknown as EffectScope;
 * scope.stop();
 * ```
 *
 * 方案 2：显式声明方法返回类型 + return 占位
 * 在被装饰方法上声明返回 EffectScope，并在方法体末尾添加占位 return，
 * 这样调用侧可以直接获得正确的类型推断：
 * ```ts
 * import type { EffectScope } from 'vue';
 *
 * class DemoService {
 *   @RunInScope
 *   public setup(): EffectScope {
 *     watchEffect(() => { ... });
 *     return null as any;
 *     // 或者：return null as unknown as EffectScope;
 *   }
 * }
 * ```
 */
type DecorableMethod = (this: any, ...args: any[]) => void | EffectScope;

// 重载签名：支持 @RunInScope 和 @RunInScope() 两种用法
export function RunInScope(): (
  value: DecorableMethod,
  context: ClassMethodDecoratorContext
) => (this: any, ...args: any[]) => EffectScope;
export function RunInScope(
  value: DecorableMethod,
  context: ClassMethodDecoratorContext
): (this: any, ...args: any[]) => EffectScope;
export function RunInScope(
  value?: DecorableMethod,
  context?: ClassMethodDecoratorContext
): any {
  // 不带括号：@RunInScope — 直接作为装饰器调用
  if (typeof value === 'function' && context?.kind === 'method') {
    return runInScopeDecorator(value, context);
  }
  // 带括号：@RunInScope() — 作为工厂函数调用，返回装饰器
  return runInScopeDecorator;
}
