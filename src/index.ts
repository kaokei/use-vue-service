import { Container, ContainerModule, interfaces } from 'inversify';
import {
  provide,
  inject,
  getCurrentInstance,
  onUnmounted,
  reactive,
  ref,
  hasInjectionContext,
  ComponentInternalInstance,
} from 'vue';

const CONTAINER_TOKEN = 'USE_VUE_SERVICE_CONTAINER_TOKEN';
export function createToken<T>(desc: string): interfaces.ServiceIdentifier<T> {
  return Symbol.for(desc);
}
export const CURRENT_COMPONENT = createToken<ComponentInternalInstance>(
  'USE_VUE_SERVICE_COMPONENT_TOKEN'
);
interface ContainerOptions extends interfaces.ContainerOptions {
  instance?: ComponentInternalInstance | null;
}
const DEFAULT_CONTAINER_OPTIONS: ContainerOptions = {
  autoBindInjectable: false,
  defaultScope: 'Singleton',
  skipBaseClassChecks: false,
};
function getOptions(options?: ContainerOptions) {
  return Object.assign({}, DEFAULT_CONTAINER_OPTIONS, options);
}
function makeReactiveObject(_: any, obj: any) {
  if (typeof obj === 'object') {
    return reactive(obj);
  } else {
    return ref(obj);
  }
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
  if (providers instanceof ContainerModule) {
    container.load(providers);
  } else if (typeof providers === 'function') {
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

const DEFAULT_CONTAINER = createContainer();
export function useService<T>(token: interfaces.ServiceIdentifier<T>) {
  const container = getContextContainer();
  return getServiceFromContainer(container, token);
}
export function useRootService<T>(token: interfaces.ServiceIdentifier<T>) {
  return getServiceFromContainer(DEFAULT_CONTAINER, token);
}

export function declareProviders(
  providers: ContainerModule,
  options?: ContainerOptions
): void;
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
      const container = createContainer(parent, { instance, ...options });
      bindContainer(container, providers);
      onUnmounted(() => {
        container.unbindAll();
      });
      provide(CONTAINER_TOKEN, container);
    }
  }
}
export function declareRootProviders(providers: ContainerModule): void;
export function declareRootProviders(providers: (c: Container) => void): void;
export function declareRootProviders(
  providers: interfaces.Newable<any>[]
): void;
export function declareRootProviders(providers: any) {
  bindContainer(DEFAULT_CONTAINER, providers);
}
export function declareAppProviders(
  providers: ContainerModule,
  options?: ContainerOptions
): void;
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
      const container = createContainer(DEFAULT_CONTAINER, options);
      bindContainer(container, providers);
      app.onUnmounted(() => {
        container.unbindAll();
      });
      app.provide(CONTAINER_TOKEN, container);
    }
  };
}
