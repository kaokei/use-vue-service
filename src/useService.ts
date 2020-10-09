import { provide, inject } from "vue";
import { ServiceContext, DefaultContext } from "./ServiceContext";
import { ContextProps, getServiceInContext } from "./getServiceInContext";

interface IProvider<T> {
  provide: T;
  useClass: T;
  useExisting: T;
  useValue: T;
  useFactory: T;
  deps: Array<T>;
  multi: boolean;
  namespace: string;
}

export function useService(Service: any, options?: any) {
  const ctx = inject(ServiceContext, DefaultContext as ContextProps);
  const service = getServiceInContext(Service, ctx, options);
  console.log("Service, ctx :>> ", Service, ctx, service);
  return service;
}

//  todo
// 1. 依赖注入
// 2. 全局单例
// 3. 多例
// 4. 指定命名空间
// 5. 支持hook和普通函数和类

/**
 * 命名空间
 * 全局
 * 本地
 * parent-使用context-显示创建context，显示使用Provider，但是不用指定value，value是隐式赋值了，并且带有父context引用，这样就建立了context树
 * 手动指定
 *
 * 命名空间和父级组件查找是两种方式，怎么调和？
 *
 * 函数组件
 * 类组件
 * hooks
 * 函数服务
 * 类服务
 *
 */
