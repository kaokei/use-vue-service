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

export const PARAM_TYPES = 'service:paramtypes';
export const DESIGN_PARAM_TYPES = 'design:paramtypes';

export function Inject(serviceIdentifier: any) {
  return function (target: any, targetKey: string, index?: number): void {
    if (serviceIdentifier === undefined) {
      throw new Error('未提供serviceIdentifier参数');
    }

    if (typeof index === 'number') {
      const metadata =
        Reflect.getMetadata(PARAM_TYPES, target, targetKey) ||
        Reflect.getMetadata(DESIGN_PARAM_TYPES, target, targetKey);
      metadata[index] = serviceIdentifier;
      Reflect.defineMetadata(PARAM_TYPES, metadata, target, targetKey);
    }
  };
}

export function Injectable() {
  return function (target: any) {
    console.log('Injectable :>> ', 'Injectable test');
    if (Reflect.hasOwnMetadata(PARAM_TYPES, target)) {
      throw new Error('重复装饰器错误');
    }

    const metadata = Reflect.getMetadata(PARAM_TYPES, target);
    console.log('metadata :>> ', metadata);
    if (metadata) {
      return target;
    }

    const types = Reflect.getMetadata(DESIGN_PARAM_TYPES, target) || [];
    console.log('types :>> ', types, target);
    Reflect.defineMetadata(PARAM_TYPES, types, target);

    return target;
  };
}
