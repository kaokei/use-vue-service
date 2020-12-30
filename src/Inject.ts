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

import { PARAM_TYPES, DESIGN_PARAM_TYPES, DESIGN_TYPE } from './ServiceContext';
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
