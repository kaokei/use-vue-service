import { injectFromSelf } from './fakeInject';

import { INJECTOR_KEY, DEFAULT_INJECTOR } from './constants';

import { Ref } from 'vue';

type Ret<T> = T extends new (...args: any) => infer S
  ? S
  : T extends Array<any>
  ? { [P in keyof T]: Ret<T[P]> }
  : T extends string | number | boolean
  ? Ref<T>
  : T;

export function useService<R, T = unknown>(
  Service: T,
  options?: any
): T extends R ? Ret<T> : Ret<R>;
export function useService(Service: any, options?: any) {
  if (__DEV__) {
    console.log('inside dev');
  }
  const currentInjector = injectFromSelf(INJECTOR_KEY, DEFAULT_INJECTOR);
  if (Array.isArray(Service)) {
    return Service.map(s => currentInjector.get(s, options));
  }
  return currentInjector.get(Service, options);
}
