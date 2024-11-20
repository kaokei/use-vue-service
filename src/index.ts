import { Container, interfaces } from 'inversify';
import {
  provide,
  inject,
  getCurrentInstance,
  onUnmounted,
  reactive,
  hasInjectionContext,
  ComponentInternalInstance,
} from 'vue';

export const POST_REACTIVE = 'METADATA_KEY_POST_REACTIVE';
export const MULTIPLE_POST_REACTIVE =
  'Cannot apply @postReactive decorator multiple times in the same class';
export const POST_REACTIVE_ERROR = (
  clazz: string,
  errorMessage: string
): string => `@postReactive error in class ${clazz}: ${errorMessage}`;
export function postReactive() {
  return (target: { constructor: NewableFunction }, propertyKey: string) => {
    const metadata = { key: POST_REACTIVE, value: propertyKey };
    if (Reflect.hasOwnMetadata(POST_REACTIVE, target.constructor)) {
      throw new Error(MULTIPLE_POST_REACTIVE);
    }
    Reflect.defineMetadata(POST_REACTIVE, metadata, target.constructor);
  };
}
function _postReactive<T extends NewableFunction>(instance: T) {
  const constr = instance.constructor;
  if (Reflect.hasMetadata(POST_REACTIVE, constr)) {
    const data = Reflect.getMetadata(POST_REACTIVE, constr) as any;
    try {
      return (instance as interfaces.Instance<T>)[data.value as string]?.();
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(POST_REACTIVE_ERROR(constr.name, e.message));
      }
    }
  }
}

export const CONTAINER_TOKEN = 'USE_VUE_SERVICE_CONTAINER_TOKEN';
export function createToken<T>(desc: string): interfaces.ServiceIdentifier<T> {
  return Symbol.for(desc);
}
export const CURRENT_COMPONENT = createToken<ComponentInternalInstance>(
  'USE_VUE_SERVICE_COMPONENT_TOKEN'
);

interface ContainerOptions extends interfaces.ContainerOptions {
  instance?: ComponentInternalInstance | null;
}
export type ExtractToken<T> = T extends interfaces.Newable<infer U> ? U : never;

const DEFAULT_CONTAINER_OPTIONS: ContainerOptions = {
  autoBindInjectable: false,
  defaultScope: 'Singleton',
  skipBaseClassChecks: false,
};
function getOptions(options?: ContainerOptions) {
  return Object.assign({}, DEFAULT_CONTAINER_OPTIONS, options);
}
function makeReactiveObject(_: any, obj: any) {
  // 这里默认obj是一个对象
  // 因为当前库只是劫持了to/toSelf方法，所以obj一定是类的实例
  // 虽然通过特殊构造函数可以返回非对象的实例，但是这里不考虑这种特殊情况
  const res = reactive(obj);
  _postReactive(res);
  return res;
}
function createContainer(parent?: Container, opts?: ContainerOptions) {
  let container: Container;
  const options = getOptions(opts);
  if (parent) {
    container = parent.createChild(options);
  } else {
    container = new Container(options);
  }
  if (opts?.instance) {
    container.bind(CURRENT_COMPONENT).toConstantValue(opts.instance);
  }
  return reactiveContainer(container);
}
function reactiveContainer(container: Container) {
  const originalBind = container.bind;
  const newBind = (serviceIdentifier: any) => {
    const bindingToSyntax = originalBind.call(container, serviceIdentifier);
    const methods = ['to', 'toSelf'];
    for (let i = 0; i < methods.length; i++) {
      const method = methods[i];
      const originalMethod = (bindingToSyntax as any)[method];
      (bindingToSyntax as any)[method] = (...args: any[]) => {
        const result = originalMethod.apply(bindingToSyntax, args);
        if (result?.onActivation) {
          result.onActivation(makeReactiveObject);
        }
        return result;
      };
    }
    return bindingToSyntax;
  };
  container.bind = newBind as any;
  return container;
}
function bindContainer(container: Container, providers: any) {
  if (typeof providers === 'function') {
    providers(container);
  } else {
    for (let i = 0; i < providers.length; i++) {
      const s = providers[i];
      container.bind(s).toSelf();
    }
  }
}
function getServiceFromContainer<T>(
  container: Container,
  token: interfaces.ServiceIdentifier<T>
) {
  return container.get(token);
}
function getCurrentContainer() {
  const instance: any = getCurrentInstance();
  if (instance) {
    const token = CONTAINER_TOKEN;
    const provides = instance.provides;
    if (provides?.hasOwnProperty && provides.hasOwnProperty(token)) {
      return provides[token];
    }
  } else {
    console.warn(
      `declareProviders can only be used inside setup() or functional components.`
    );
  }
}
function getContextContainer() {
  if (hasInjectionContext()) {
    const token = CONTAINER_TOKEN;
    const defaultValue = DEFAULT_CONTAINER;
    const instance: any = getCurrentInstance();
    if (instance) {
      const provides = instance.provides;
      return provides[token] || defaultValue;
    } else {
      return inject(token, defaultValue);
    }
  } else {
    console.warn(
      `declareAppProviders|declareProviders|useService can only be used inside setup() or functional components.`
    );
  }
}

export const DEFAULT_CONTAINER = createContainer();
export function useService<T>(token: interfaces.ServiceIdentifier<T>) {
  const container = getContextContainer();
  return getServiceFromContainer(container, token);
}
export function useRootService<T>(token: interfaces.ServiceIdentifier<T>) {
  return getServiceFromContainer(DEFAULT_CONTAINER, token);
}

export function declareProviders(
  providers: (c: Container) => void,
  options?: ContainerOptions
): void;
export function declareProviders(
  providers: interfaces.Newable<any>[],
  options?: ContainerOptions
): void;
export function declareProviders(providers: any, options?: ContainerOptions) {
  const currentContainer = getCurrentContainer();
  if (currentContainer) {
    bindContainer(currentContainer, providers);
  } else {
    const parent = getContextContainer();
    if (parent) {
      const instance = getCurrentInstance();
      let container = createContainer(parent, { instance, ...options });
      bindContainer(container, providers);
      onUnmounted(() => {
        container.unbindAll();
        container = null as any;
      });
      provide(CONTAINER_TOKEN, container);
    }
  }
}

export function declareRootProviders(providers: (c: Container) => void): void;
export function declareRootProviders(
  providers: interfaces.Newable<any>[]
): void;
export function declareRootProviders(providers: any) {
  bindContainer(DEFAULT_CONTAINER, providers);
}

export function declareAppProviders(
  providers: (c: Container) => void,
  options?: ContainerOptions
): void;
export function declareAppProviders(
  providers: interfaces.Newable<any>[],
  options?: ContainerOptions
): void;
export function declareAppProviders(
  providers: any,
  options?: ContainerOptions
) {
  return (app: any) => {
    const appContainer = getContextContainer();
    if (appContainer) {
      bindContainer(appContainer, providers);
    } else {
      let container = createContainer(DEFAULT_CONTAINER, options);
      bindContainer(container, providers);
      app.onUnmounted(() => {
        container.unbindAll();
        container = null as any;
      });
      app.provide(CONTAINER_TOKEN, container);
    }
  };
}
