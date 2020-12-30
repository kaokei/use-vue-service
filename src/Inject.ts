/**
 * class decorator:
 *   只有一个参数：构造函数
 * property decorator:
 *   静态属性：构造函数, 属性名
 *   实例属性：原型, 属性名
 * parameter decorator:
 *   构造函数参数：构造函数, undefined, 0
 *   普通函数参数：原型, 方法名, 0
 *   静态函数参数：构造函数, 方法名, 0
 * method decorator:
 *   静态方法：构造函数, 方法名, 属性描述符
 *   实例方法：原型, 方法名, 属性描述符
 * accessor decorator:
 *   静态访问器：构造函数, 方法名, 属性描述符
 *   实例访问器：原型, 方法名, 属性描述符
 */

import { Options } from 'vue-class-component';
import { declareProviders } from './declareProviders';
import { useService } from './useService';

export const PARAM_TYPES = 'service:paramtypes';
export const DESIGN_PARAM_TYPES = 'design:paramtypes';
export const DESIGN_TYPE = 'design:type';

export interface InjectType {
  name: string | number;
  type: any;
}

type InjectTypes = Array<InjectType>;

/**
 * 可以使用在类构造函数的参数中和类的实例属性中
 *
 * @export
 * @param {*} serviceIdentifier
 * @return {*} void
 */
export function Inject(serviceIdentifier: any) {
  return function (target: any, targetKey: string, index?: number): void {
    const Ctor = typeof target === 'function' ? target : target.constructor;

    const metadata = Reflect.getMetadata(PARAM_TYPES, Ctor, targetKey) ||
      Reflect.getMetadata(DESIGN_PARAM_TYPES, Ctor, targetKey) || {
        index: [],
        name: [],
      };

    if (typeof index === 'number') {
      metadata.index[index] = { name: index, type: serviceIdentifier };
      Reflect.defineMetadata(PARAM_TYPES, metadata, target, targetKey);
    } else {
      metadata.name.push({
        name: targetKey,
        type: serviceIdentifier || Reflect.getMetadata(DESIGN_TYPE, target, targetKey),
      });
    }
  };
}

/**
 * 表明服务可注入
 * 主要工作就是收集构造函数的参数类型信息
 *
 * @export
 * @return {*}
 */
export function Injectable() {
  return function (target: any): void {
    if (Reflect.hasOwnMetadata(PARAM_TYPES, target)) {
      throw new Error('重复装饰器错误');
    }

    const metadata = Reflect.getMetadata(PARAM_TYPES, target);
    if (metadata) {
      return;
    }

    const types = Reflect.getMetadata(DESIGN_PARAM_TYPES, target) || [];
    const newTypes = types.map((type: any, index: number) => ({
      name: index,
      type: type,
    }));
    Reflect.defineMetadata(PARAM_TYPES, newTypes, target);
  };
}

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
        let result = originSetup ? originSetup(props, ctx) : {};
        const metadata = Reflect.getMetadata(PARAM_TYPES, target);
        const services = useService(metadata.map((item: any) => item.type));

        if (result instanceof Promise) {
          result = result.then(res => {
            metadata.forEach(
              (item: any, index: number) => (res[item.name] = services[index])
            );
            return res;
          });
        } else {
          metadata.forEach(
            (item: any, index: number) => (result[item.name] = services[index])
          );
        }

        return result;
      };
    });
  };
}
