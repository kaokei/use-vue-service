import { provide, getCurrentInstance, onUnmounted } from 'vue';
import { INJECTOR_KEY } from './constants';
import { DEFAULT_INJECTOR } from './defaultInjector';

import { inject } from './fakeInject';
import { createInjector } from './utils';

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
 *    从这个角度来看，我的declareProviders可以看作是原生vue的provide的升级版本
 *
 * @export
 * @param {any[]} providers
 */
export function declareProviders(providers: any[]) {
  const instance = getCurrentInstance();
  if (!instance) {
    throw new Error('declareProviders can only be used inside setup function.');
  }
  const parentInjector = inject(INJECTOR_KEY, DEFAULT_INJECTOR);
  if (parentInjector.uid === instance.uid) {
    throw new Error('declareProviders can only be called once.');
  }
  const currentInjector = createInjector(providers, parentInjector);
  (<any>currentInjector).uid = instance.uid;

  onUnmounted(() => {
    currentInjector.dispose();
  });

  provide(INJECTOR_KEY, currentInjector);
}

/**
 * 实际上所有Injectable的Class都是兜底到root injector中
 * 不需要特意调用declareRootProviders声明
 * 这个方法是用于声明不是Injectable的Class的其他类型的Provider
 * @param providers
 */
export function declareRootProviders(providers: any[]) {
  DEFAULT_INJECTOR.addProviders(providers);
}
