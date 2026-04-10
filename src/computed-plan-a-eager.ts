import { computed, reactive } from 'vue';
import { getEffectScope } from './scope.ts';

// Plan_A_Eager（提前创建策略）：
// 在装饰器执行阶段，通过 context.addInitializer 注册回调。
// 回调在 new ClassName() 构造函数中执行，此时 this 是原始实例（非 reactive）。
// 在回调中创建 ComputedRef 并赋值为同名数据属性。
//
// 核心技术挑战：addInitializer 回调中 this 是原始实例，尚未被 reactive() 包装。
// ComputedRef 内部的 getter 需要通过 reactive 代理访问依赖属性才能建立响应式追踪。
//
// 解决方案：在 ComputedRef 的 getter 中调用 reactive(this)。
// Vue 的 reactive() 对已经被 reactive 包装过的对象会返回同一个代理（幂等性）。
// 当 DI 容器后续调用 reactive(obj) 时，Vue 内部会复用已有的代理，
// 因此 getter 内部的 reactive(that) 和 DI 容器创建的代理是同一个对象。
export function ComputedPlanAEager(): (
  value: (this: any) => any,
  context: ClassGetterDecoratorContext
) => void {
  return function (
    value: (this: any) => any,
    context: ClassGetterDecoratorContext
  ): void {
    const propertyName = context.name;
    context.addInitializer(function (this: any) {
      // this 是原始实例（非 reactive），尚未被 DI 容器的 onActivation 包装
      const scope = getEffectScope(this);
      const that = this;
      // 在 computed 的 getter 中使用 reactive(that) 获取响应式代理引用，
      // 确保依赖属性的读取能被 Vue 的响应式系统正确追踪。
      // reactive() 具有幂等性：对同一个原始对象多次调用返回同一个代理。
      //
      // 注意：不能在此处强制求值 computedRef.value，因为 addInitializer 回调
      // 在字段初始化器之前执行，此时 this.id 等字段尚未初始化（值为 undefined）。
      // Vue 的 computed 是惰性的，首次求值会延迟到 .value 被访问时。
      const computedRef = scope.run(() =>
        computed(() => value.call(reactive(that)))
      );
      // 在原始实例上创建同名数据属性（ComputedRef），覆盖原型链上的 getter。
      // 当 DI 容器后续调用 reactive(obj) 时，该数据属性会被代理，
      // Auto_Unwrap 机制会自动解包 ComputedRef，返回其 .value 值。
      Object.defineProperty(that, propertyName, {
        value: computedRef,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    });
    // 不返回新的 getter 函数（返回 void / undefined）
  };
}
