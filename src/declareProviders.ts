import { provide, inject, getCurrentInstance } from 'vue';
import { ServiceContext, DefaultContext } from './ServiceContext';

/**
 * 类组件可以通过装饰器声明providers，内部实际上也是调用的declareProviders方法
 * 但是options组件或者defineComponent组件则必须在setup函数中手动调用declareProviders方法
 * 我有考虑过增加一个option，比如providers，就像vue-rx增加了subscriptions属性一样。
 * 最终没有实现，是因为一方面实现成本有点高（我不会。。。）
 * 还有一种思路就是包装defineComponent，代理setup函数，把providers属性转为declareProviders函数调用。
 * 这种做法的成本是最低的，但是有两点限制，第一用户可以不使用defineComponent来定义组件，第二用户得转变使用习惯，从我的包里面导入defineComponent
 * 还考虑到官网的示例代码中也是直接在setup函数中调用provide函数，而且vue2.x版本中就是采用的provide/inject属性来配置。vue3中已经转为函数了
 * 我觉得我也没有必要一定为了追求声明式代码，强制实现声明式功能
 *
 * 1. 需要解决重复调用的问题
 * 2. 不能直接利用原型来索引，因为provide不仅仅是string|symbol，还可能是类
 *
 * @export
 * @param {any[]} providers
 */
export function declareProviders(providers: any[]) {
  const instance: any = getCurrentInstance();
  if (!instance) {
    throw new Error('declareProviders 只能在setup内部使用');
  }
  if (instance.__current_providers__) {
    throw new Error('禁止重复调用declareProviders');
  }
  const parentCtx = inject(ServiceContext, DefaultContext);
  const newProviders = providers.map(p => {
    if (p.provide) {
      return p;
    } else {
      return {
        provide: p,
        useClass: p,
      };
    }
  });
  const currentCtx = {
    parent: parentCtx,
    providers: newProviders,
  };
  instance.__current_providers__ = currentCtx;
  provide(ServiceContext, currentCtx);
}
