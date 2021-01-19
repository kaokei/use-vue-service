import { inject } from 'vue';

import { IOptions, IContextProps, useServiceWithContext } from './getServiceInContext';

import { ServiceContext, DefaultContext } from './ServiceContext';

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
  const ctx = inject(ServiceContext, DefaultContext as IContextProps);
  if (Array.isArray(Service)) {
    return Service.map(s => useServiceWithContext(s, ctx, options));
  }
  return useServiceWithContext(Service, ctx, options);
}
