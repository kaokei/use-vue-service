import { Options } from 'vue-class-component';
import { declareProviders } from './declareProviders';
import { merge } from './utils';
import { INJECTOR_KEY, DEFAULT_INJECTOR } from './constants';
import { injectFromSelf } from './fakeInject';

/**
 * 禁止在组件的构造函数中声明依赖注入
 * 因为类组件需要继承Vue，Vue已经定义了自己的构造函数，导致子类必须在构造函数中手动调用super(props, ctx);
 * 第二点就是组件在实例化的时候，已经写死了`new Ctor(props, ctx);`
 * 没有办法实现依赖注入，假设vue-class-component库支持传递多余的参数`new Ctor(props, ctx, ...rest);`
 * 我认为数据不需要proxy，只需要reactive即可
 *
 * 这里是代理了Options的功能
 *
 * 并且仿造了createDecorator的逻辑来代理setup函数
 *
 * @export
 * @return {*}
 */
export function Component(options: any = {}) {
  return function (target: any) {
    const { providers } = options;
    delete options.providers;

    // 优先执行Options
    // 稍后再补充我们自己的逻辑
    Options(options)(target);

    if (!target.__d) {
      target.__d = [];
    }
    target.__d.push((options: any) => {
      // 注意options.setup是由上方Options方法包装的
      // options本身是没有setup这个属性的
      const originSetup = options.setup;

      options.setup = (props: any, ctx: any) => {
        if (providers) {
          declareProviders(providers);
        }

        const parentInjector = injectFromSelf(INJECTOR_KEY, DEFAULT_INJECTOR);

        // 获取构造函数的实例属性
        // 注意组件不支持构造函数参数注入实例属性
        const properties = parentInjector.getInjectProperties(target);

        // 这里的setupState只能是promise或者plaindata
        // 而不会是render function
        const setupState = originSetup ? originSetup(props, ctx) : {};

        let result: any = null;

        // 这个merge的过程其实最好是写在vue-class-component中
        // 但是估计pr不会被接受
        if (setupState instanceof Promise) {
          result = setupState.then(state => {
            return merge(state, properties);
          });
        } else {
          result = merge(setupState, properties);
        }

        return result;
      };
    });

    return target;
  };
}
