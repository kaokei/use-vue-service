import { inject, reactive } from 'vue';
import { ServiceContext, DefaultContext } from './ServiceContext';
import { IContextProps, getServiceInContext } from './getServiceInContext';

type TupleConstructor<T> = {
  [P in keyof T]: T[P] extends new (...args: any) => infer R ? R : T[P];
};

type Ret<T> = T extends new (...args: any) => infer S
  ? S
  : T extends Array<any>
  ? TupleConstructor<T>
  : T;

export function useService<T>(Service: T, options?: any): Ret<T>;
export function useService(Service: any, options?: any) {
  if (Array.isArray(Service)) {
    return Service.map(s => useService(s));
  }
  const ctx = inject(ServiceContext, DefaultContext as IContextProps);
  const service = getServiceInContext(Service, ctx, options);
  return reactive(service);
}
