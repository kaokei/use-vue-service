import { SERVICE_PARAM_TYPES, DESIGN_PARAM_TYPES } from './ServiceContext';

/**
 * 表明服务可注入
 * 主要工作就是收集构造函数的参数类型信息
 *
 * @export
 * @return {*}
 */
export function Injectable() {
  return function (target: any) {
    if (Reflect.hasOwnMetadata(SERVICE_PARAM_TYPES, target)) {
      throw new Error('重复Injectable装饰器错误');
    }

    const types = Reflect.getMetadata(DESIGN_PARAM_TYPES, target) || [];
    Reflect.defineMetadata(SERVICE_PARAM_TYPES, types, target);

    return target;
  };
}
