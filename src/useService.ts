import { inject, reactive } from 'vue';
import { ServiceContext, DefaultContext } from './ServiceContext';
import { IContextProps, getServiceInContext } from './getServiceInContext';

export function useService<T = string>(Service: string, options?: any): T;
export function useService<T, K = void>(
  Service: new (...args: any[]) => K,
  options?: any
): K extends T ? K : T;
export function useService(Service: any, options?: any) {
  const ctx = inject(ServiceContext, DefaultContext as IContextProps);
  const service = getServiceInContext(Service, ctx, options);
  return reactive(service);
}
