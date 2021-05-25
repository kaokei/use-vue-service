import { Options } from 'vue-class-component';
import { declareProviders } from './declareProviders';
import { getPropertiesByClass } from './getServiceInContext';
import { merge } from './utils';

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

    Options(options)(target); // 使用@Component代替@Options

    if (!target.__d) {
      target.__d = [];
    }
    target.__d.push((options: any) => {
      const originSetup = options.setup;

      options.setup = (props: any, ctx: any) => {
        if (providers) {
          declareProviders(providers);
        }

        // 获取构造函数的实例属性
        // 注意组件不支持构造函数参数注入实例属性
        const properties = getPropertiesByClass(target);

        const setupState = originSetup ? originSetup(props, ctx) : {};

        let result: any = null;

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
