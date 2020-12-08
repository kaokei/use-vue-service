import { inject, reactive } from 'vue';
import { ServiceContext, DefaultContext } from './ServiceContext';
import { IContextProps, getServiceInContext, IOptions } from './getServiceInContext';

type Ret<T> = T extends new (...args: any) => infer S
  ? S
  : T extends Array<any>
  ? { [P in keyof T]: Ret<T[P]> }
  : T;

export function useService<R, T = unknown>(
  Service: T,
  options?: IOptions
): T extends R ? Ret<T> : Ret<R>;
export function useService(Service: any, options?: IOptions) {
  if (Array.isArray(Service)) {
    return Service.map(s => useService(s, options));
  }
  let ctx = inject(ServiceContext, DefaultContext as IContextProps);
  if (options && options.skip) {
    let skip = Number(options.skip);
    while (skip > 0 && ctx.parent) {
      if (ctx.providers.find(item => item.provide === Service)) {
        skip--;
      }
      ctx = ctx.parent;
    }
  }
  const service = getServiceInContext(Service, ctx, options);
  return reactive(service);
}
