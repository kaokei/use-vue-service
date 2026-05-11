import { reactive } from 'vue';
import { RAW_CLASS_KEY } from './constants';

/**
 * 方法装饰器：自动绑定方法的 this 到实例（Vue 响应式兼容版）
 *
 * 与 @kaokei/di 原始 autobind 的区别：
 * - 原始版：value.bind(this) — 绑定到原始实例，reactive() 后方法内修改丢失响应式
 * - 本版：value.bind(reactive(this)) — 利用 Vue 3 reactive() 幂等性，this 指向 proxy
 *
 * 调用场景全覆盖：
 * - proxy.method()         → this = proxy → 响应式生效 ✅
 * - const m = proxy.method; m() → this = proxy → 响应式生效 ✅
 * - Promise.then(service.method) → this = proxy → 响应式生效 ✅
 * - setTimeout(service.method, 0) → this = proxy → 响应式生效 ✅
 *
 * @Raw 兼容：通过 context.metadata[RAW_CLASS_KEY] 判断，@Raw 类直接 bind raw
 */
export function autobind<T extends (...args: any[]) => any>(
  value: T,
  context: ClassMethodDecoratorContext
) {
  const methodName = context.name;
  const originalMethod = value;

  context.addInitializer(function (this: any) {
    const isRawClass = context.metadata?.[RAW_CLASS_KEY] === true;
    this[methodName] = isRawClass
      ? originalMethod.bind(this)
      : originalMethod.bind(reactive(this));
  });
}
