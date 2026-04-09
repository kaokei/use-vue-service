import { EffectScope, effectScope } from 'vue';
import { SCOPE_KEY } from './constants.ts';

/**
 * 本模块用于为类的实例对象管理 Vue 的 EffectScope。
 *
 * 核心思路：通过一个 Symbol key（SCOPE_KEY）在实例对象上挂载唯一的 EffectScope，
 * 从而将该实例相关的 computed、watch 等响应式副作用统一收集到这个 scope 中。
 * 当实例销毁时，只需 stop 这个 scope，即可自动清理所有关联的响应式副作用，
 * 避免内存泄漏。
 *
 * 设计保证：每个实例对象上最多只存在一个 EffectScope（通过 getEffectScope 懒创建）。
 */

/**
 * 为实例对象创建一个新的 EffectScope，并挂载到对象的 SCOPE_KEY 属性上。
 * 使用 effectScope(true) 创建独立的（detached）scope，
 * 使其不受外层 scope 的 stop 影响，生命周期完全由自身控制。
 */
export function createScope(obj: object): EffectScope {
  const that = obj as any;
  const scope = effectScope(true);
  that[SCOPE_KEY] = scope;
  return scope;
}

/**
 * 获取实例对象上已有的 EffectScope。
 * 如果对象上尚未挂载 scope，则返回 undefined。
 */
export function getScope(obj: object): EffectScope | undefined {
  const that = obj as any;
  return that[SCOPE_KEY];
}

/**
 * 移除并停止实例对象上的 EffectScope。
 * 调用 scope.stop() 会自动清理该 scope 内所有的 computed、watch 等响应式副作用，
 * 随后从对象上删除 SCOPE_KEY 属性，彻底解除关联。
 */
export function removeScope(obj: object): void {
  const that = obj as any;
  if (that) {
    const scope = getScope(that);
    if (scope) {
      scope.stop();
      delete that[SCOPE_KEY];
    }
  }
}

/**
 * 获取实例对象的 EffectScope，如果不存在则自动创建。
 * 这是外部最常用的入口函数，保证每个实例对象上有且仅有一个 EffectScope。
 */
export function getEffectScope(obj: object): EffectScope {
  const scope = getScope(obj);
  if (!scope) {
    return createScope(obj);
  }
  return scope;
}
