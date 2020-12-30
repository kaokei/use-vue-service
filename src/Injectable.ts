import { PARAM_TYPES, DESIGN_PARAM_TYPES } from './ServiceContext';

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
