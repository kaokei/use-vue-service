import { inject } from "vue";
import { ServiceContext, DefaultContext } from "./ServiceContext";
import { ContextProps, getServiceInContext } from "./getServiceInContext";

interface IProvider<T> {
  provide: T;
  useClass: T;
  useExisting: T;
  useValue: T;
  useFactory: T;
  deps: Array<T>;
  multi: boolean;
  namespace: string;
}

export function useService(Service: any, options?: any) {
  const ctx = inject(ServiceContext, DefaultContext as ContextProps);
  const service = getServiceInContext(Service, ctx, options);
  return service;
}
