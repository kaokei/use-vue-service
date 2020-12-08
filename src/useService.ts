import { inject, reactive } from 'vue';
import { ServiceContext, DefaultContext } from './ServiceContext';
import { IContextProps, getServiceInContext } from './getServiceInContext';

type Ret<T> = T extends new (...args: any) => infer S
  ? S
  : T extends Array<any>
  ? { [P in keyof T]: Ret<T[P]> }
  : T;

export function useService<R, T = unknown>(
  Service: T,
  options?: any
): T extends R ? Ret<T> : Ret<R>;
export function useService(Service: any, options?: any) {
  if (Array.isArray(Service)) {
    return Service.map(s => useService(s));
  }
  const ctx = inject(ServiceContext, DefaultContext as IContextProps);
  const service = getServiceInContext(Service, ctx, options);
  return reactive(service);
}
