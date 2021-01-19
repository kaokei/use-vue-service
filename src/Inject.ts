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

import {
  SERVICE_INJECTED_KEY,
  SERVICE_INJECTED_PARAMS,
  SERVICE_INJECTED_PROPS,
  DESIGN_TYPE,
} from './ServiceContext';

// 可以使用在类构造函数的参数中和类的实例属性中
export const Inject = createPropertyDecorator(SERVICE_INJECTED_KEY);

// 指定往上跳过几次context
export const Skip = createPropertyDecorator('skip', true);

// 指定namespace
export const Namespace = createPropertyDecorator('namespace', true);

function createPropertyDecorator(decoratorKey: string, defaultValue?: any) {
  return function (serviceIdentifier?: any) {
    return function (target: any, targetKey: string, index?: number): void {
      const isParameterDecorator = typeof index === 'number';
      const Ctor = isParameterDecorator ? target : target.constructor;
      const key = index !== undefined && isParameterDecorator ? index : targetKey;

      const metadataKey = isParameterDecorator
        ? SERVICE_INJECTED_PARAMS
        : SERVICE_INJECTED_PROPS;

      const paramsOrPropertiesMetadata = Reflect.getMetadata(metadataKey, Ctor) || {};

      // 每个参数或者实例属性都可以有多个装饰器
      const paramOrPropertyMetadata = paramsOrPropertiesMetadata[key] || [];

      const metadata = {
        key: decoratorKey,
        value: serviceIdentifier || defaultValue,
      };

      if (decoratorKey === SERVICE_INJECTED_KEY) {
        metadata.value =
          serviceIdentifier || Reflect.getMetadata(DESIGN_TYPE, target, targetKey);
      }

      paramOrPropertyMetadata.push(metadata);
      paramsOrPropertiesMetadata[key] = paramOrPropertyMetadata;
      Reflect.defineMetadata(metadataKey, paramsOrPropertiesMetadata, Ctor);
    };
  };
}
