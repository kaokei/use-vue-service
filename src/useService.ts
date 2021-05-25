import { inject } from './fakeInject';

import { ServiceContext, DefaultContext } from './ServiceContext';

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
  const currentInjector = inject(ServiceContext, DefaultContext as any, false, true);
  if (Array.isArray(Service)) {
    return Service.map(s => currentInjector.get(s, options));
  }
  return currentInjector.get(Service, options);
}
