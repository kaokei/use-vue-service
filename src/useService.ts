import { inject } from './fakeInject';

import { INJECTOR_KEY } from './constants';

import { DEFAULT_INJECTOR } from './defaultInjector';

import { getServiceFromInjector } from './utils';

import { Ref } from 'vue';

import { InjectionKey } from '@kaokei/di';

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
  const currentInjector = inject(INJECTOR_KEY, DEFAULT_INJECTOR);
  return getServiceFromInjector(currentInjector, token, options);
}

export function useRootService<R, T = unknown>(
  token: T,
  options?: any
): T extends R ? Ret<T> : Ret<R>;
export function useRootService(token: any, options?: any) {
  return getServiceFromInjector(DEFAULT_INJECTOR, token, options);
}
