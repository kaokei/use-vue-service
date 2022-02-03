import { injectFromSelf } from './fakeInject';

import { INJECTOR_KEY } from './constants';
import { DEFAULT_INJECTOR } from './defaultInjector';

import { Ref, InjectionKey } from 'vue';

import { Injector } from '@kaokei/di';

function getServiceFromInjector(injector: Injector, token: any, options?: any) {
  if (Array.isArray(token)) {
    return token.map(t => injector.get(t, options));
  }
  return injector.get(token, options);
}

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
  token: T,
  options?: any
): T extends R ? Ret<T> : Ret<R>;
export function useService(token: any, options?: any) {
  const currentInjector = injectFromSelf(INJECTOR_KEY, DEFAULT_INJECTOR);
  return getServiceFromInjector(currentInjector, token, options);
}

export function useRootService(token: any, options?: any) {
  return getServiceFromInjector(DEFAULT_INJECTOR, token, options);
}
