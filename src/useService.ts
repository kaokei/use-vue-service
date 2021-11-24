import { injectFromSelf } from './fakeInject';

import { INJECTOR_KEY } from './constants';
import { DEFAULT_INJECTOR } from './defaultInjector';

import { Ref, InjectionKey } from 'vue';

import { Injector } from '@kaokei/di';

type Ret<T> = T extends new (...args: any) => infer S
  ? S
  : T extends InjectionKey<infer M>
  ? Ret<M>
  : T extends string | number | boolean
  ? Ref<T>
  : T extends Array<any>
  ? { [P in keyof T]: Ret<T[P]> }
  : T;

export function useService<R, T = unknown>(
  Service: T,
  options?: any,
  injector?: Injector
): T extends R ? Ret<T> : Ret<R>;
export function useService(Service: any, options?: any, injector?: Injector) {
  const currentInjector =
    injector || injectFromSelf(INJECTOR_KEY, DEFAULT_INJECTOR);
  if (Array.isArray(Service)) {
    return Service.map(s => currentInjector.get(s, options));
  }
  return currentInjector.get(Service, options);
}

export function useRootService(Service: any, options: any) {
  return useService(Service, options, DEFAULT_INJECTOR);
}

export function declareRootProviders(providers: any[]) {
  providers.forEach(provider => DEFAULT_INJECTOR.addProvider(provider));
}
